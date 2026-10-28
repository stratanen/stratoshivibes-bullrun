// StratoshiVibes leaderboard (Blockspace and Bull Run), a Cloudflare Worker with a D1 database bound as DB.
// Players sign in once by signing a plain message with their wallet (no transaction, no fees).
// The worker checks the ed25519 signature, then accepts end-of-game scores from that address.

const ALLOWED_ORIGINS = ['https://blockspace.stratoshivibes.com', 'https://bullrun.stratoshivibes.com', 'https://arcade.stratoshivibes.com', 'https://stratanen.github.io'];

// Bull Run boards. 'endless' = metres driven (higher is better). 't:t1'..'t:t9' = race time in ms (lower is better).
// Times are stored as negative numbers so the same "highest first" ranking works for both.
// The minimum times are the track length driven at nitro speed the whole way, so anything faster is impossible.
const BULLRUN_TRACK_LEN = { t1: 2600, t2: 3200, t3: 3800, t4: 3200, t5: 3800, t6: 4400, t7: 3800, t8: 4400, t9: 5000 };
const BULLRUN_NITRO_MS = 93.8;          // metres per second at full nitro
const BULLRUN_MAX_ENDLESS = 500000;     // 500 km in one endless run is treated as tampering
const BULLRUN_DAILY_LEN = 3600;         // the daily track ('d:YYYY-MM-DD') is always 3.6 km; today's and yesterday's boards accept results
function bullrunCheck(board, value) {
  if (!Number.isInteger(value) || value <= 0) return null;
  const dm = /^d:(\d{4}-\d{2}-\d{2})$/.exec(board || '');
  if (dm) {
    const now = Date.now();
    if (dm[1] !== utcDay(now) && dm[1] !== utcDay(now - 864e5)) return null;
    return value >= Math.floor(BULLRUN_DAILY_LEN / BULLRUN_NITRO_MS * 1000) && value <= 30 * 60e3 ? -value : null;
  }
  if (board === 'endless') return value <= BULLRUN_MAX_ENDLESS ? value : null;
  const m = /^t:(t[1-9])$/.exec(board || '');
  if (!m) return null;
  const minMs = Math.floor(BULLRUN_TRACK_LEN[m[1]] / BULLRUN_NITRO_MS * 1000);
  return value >= minMs && value <= 30 * 60e3 ? -value : null;
}
const brPeriod = (board, scope) => 'br|' + board + '|' + scope;

// Seeker Genesis Token check, ported from @solana-mobile/skr-genesis-token (Apache-2.0) without dependencies.
// An SGT is a Token-2022 mint whose TokenGroupMember extension points at the SGT group and whose MetadataPointer points at the same address.
const SGT_GROUP = 'GT22s89nU4iWFkNXj1Bw6uYhJJWDRPpShHt4Bk8f99Te', TOKEN_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
const B58A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58enc(bytes){ let n = 0n; for (const x of bytes) n = n * 256n + BigInt(x); let s = ''; while (n > 0n) { s = B58A[Number(n % 58n)] + s; n /= 58n; } for (const x of bytes) { if (x === 0) s = '1' + s; else break; } return s; }
function b64bytes(str){ const bin = atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function isSgtMint(d){
  if (d.length < 166 || d[165] !== 1) return false;
  let off = 166, group = null, meta = null, member = false;
  while (off + 4 <= d.length) {
    const type = d[off] | (d[off + 1] << 8), len = d[off + 2] | (d[off + 3] << 8), s = off + 4, e = s + len;
    if (type === 0 || e > d.length) break;
    if (type === 18 && len === 64) meta = b58enc(d.subarray(s + 32, s + 64));
    else if (type === 23 && len === 72) { group = b58enc(d.subarray(s + 32, s + 64)); member = true; }
    off = e;
  }
  return member && group === SGT_GROUP && meta === SGT_GROUP;
}
async function sgtMints(rpcUrl, owner, timeoutMs){
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, to = ctl && setTimeout(() => ctl.abort(), timeoutMs || 8000);
  const call = (method, params) => fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: ctl && ctl.signal })
    .then(r => r.json()).then(j => { if (j.error) throw new Error(j.error.message || 'rpc error'); return j.result; });
  try {
    const ta = await call('getTokenAccountsByOwner', [owner, { programId: TOKEN_2022 }, { encoding: 'jsonParsed', commitment: 'confirmed' }]);
    const mints = [...new Set((ta.value || []).filter(a => a.account.data.parsed.info.tokenAmount.amount !== '0').map(a => a.account.data.parsed.info.mint))];
    const out = [];
    for (let i = 0; i < mints.length; i += 100) {
      const batch = mints.slice(i, i + 100), r = await call('getMultipleAccounts', [batch, { encoding: 'base64', commitment: 'confirmed' }]);
      (r.value || []).forEach((acc, k) => { if (acc && acc.owner === TOKEN_2022 && isSgtMint(b64bytes(acc.data[0]))) out.push(batch[k]); });
    }
    return out;
  } finally { if (to) clearTimeout(to); }
}

// Seeker owners: checked on the chain at every ranking sign-in (Blockspace and Bull Run) (after the signature proves the address).
// The table is created on first use, so no manual SQL is needed. RPC_URL can be set as a Worker variable; the public endpoint is the fallback.
let seekerTableReady = false;
async function ensureSeekerTable(env){
  if (seekerTableReady) return;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS seekers (addr TEXT PRIMARY KEY, mint TEXT NOT NULL, at INTEGER NOT NULL)').run();
  seekerTableReady = true;
}
async function refreshSeeker(env, addr){
  await ensureSeekerTable(env);
  try {
    const mints = await sgtMints(env.RPC_URL || 'https://api.mainnet-beta.solana.com', addr, 6000);
    if (mints.length) { await env.DB.prepare('INSERT OR REPLACE INTO seekers (addr, mint, at) VALUES (?, ?, ?)').bind(addr, mints[0], Date.now()).run(); return true; }
    await env.DB.prepare('DELETE FROM seekers WHERE addr = ?').bind(addr).run(); return false;
  } catch (e) {
    const row = await env.DB.prepare('SELECT addr FROM seekers WHERE addr = ?').bind(addr).first();   // RPC down: keep what we knew
    return !!row;
  }
}
const MAX_SCORE = 5000000;         // anything above is treated as tampering (scores are 10x since Oct 2026)
const MIN_GAP_MS = 15000;          // at most one score every 15 seconds per player
const SESSION_DAYS = 60;

// ---------- anonymous play counter ----------
// The games send, about once a minute while they are on screen: the game, what is on screen (menu or a game mode),
// the seconds spent there, a random device number made on the device, and app/browser. No address, no IP, no cookies.
// One row per day, game, mode and device. Rows older than 400 days are deleted.
// The stats page is /dash. It needs the secret STATS_KEY (Worker settings -> Variables and Secrets).
const STATS_GAMES = ['bullrun', 'blockspace', 'arcade'];
let statsTableReady = false;
async function ensureStatsTable(env){
  if (statsTableReady) return;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS plays (day TEXT NOT NULL, game TEXT NOT NULL, mode TEXT NOT NULL, dev TEXT NOT NULL, src TEXT NOT NULL, secs INTEGER NOT NULL, PRIMARY KEY (day, game, mode, dev))').run();
  statsTableReady = true;
}
const athensDay = ms => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Athens', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
async function recordPing(env, body){
  let o; try { o = JSON.parse(body); } catch (e) { return false; }
  if (!o || !STATS_GAMES.includes(o.g) || typeof o.d !== 'string' || !/^[a-z0-9]{12,32}$/.test(o.d) || !Array.isArray(o.t) || o.t.length > 8) return false;
  const src = typeof o.p === 'string' && /^(app|android|ios|desktop)(-seeker)?$/.test(o.p) ? o.p : 'other';
  const day = athensDay(Date.now());
  await ensureStatsTable(env);
  const stmts = [];
  for (const it of o.t) {
    if (!Array.isArray(it)) continue;
    const mode = String(it[0] || ''), secs = Math.round(+it[1] || 0);
    if (!/^[a-z0-9:_-]{1,24}$/.test(mode) || secs <= 0 || secs > 120) continue;
    stmts.push(env.DB.prepare('INSERT INTO plays (day, game, mode, dev, src, secs) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (day, game, mode, dev) DO UPDATE SET secs = MIN(secs + excluded.secs, 57600), src = excluded.src')
      .bind(day, o.g, mode, o.d, src, secs));
  }
  if (stmts.length) await env.DB.batch(stmts);
  return true;
}
async function statsData(env){
  await ensureStatsTable(env);
  const now = Date.now(), d30 = athensDay(now - 29 * 864e5), d7 = athensDay(now - 6 * 864e5);
  await env.DB.prepare('DELETE FROM plays WHERE day < ?').bind(athensDay(now - 400 * 864e5)).run();
  const q = (sql, ...a) => env.DB.prepare(sql).bind(...a).all().then(r => r.results || []);
  const [daily, modes, srcs, total, back, week] = await Promise.all([
    q("SELECT day, game, COUNT(DISTINCT dev) AS players, COUNT(DISTINCT CASE WHEN mode NOT IN ('menu','lobby') THEN dev END) AS gamers, SUM(secs) AS secs FROM plays WHERE day >= ? GROUP BY day, game", d30),
    q('SELECT game, mode, COUNT(DISTINCT dev) AS players, SUM(secs) AS secs FROM plays WHERE day >= ? GROUP BY game, mode', d7),
    q('SELECT game, src, COUNT(DISTINCT dev) AS players FROM plays WHERE day >= ? GROUP BY game, src', d30),
    q('SELECT game, COUNT(DISTINCT dev) AS players, SUM(secs) AS secs, MIN(day) AS since FROM plays GROUP BY game'),
    q('SELECT game, COUNT(*) AS players FROM (SELECT game, dev FROM plays WHERE day >= ? GROUP BY game, dev HAVING COUNT(DISTINCT day) > 1) GROUP BY game', d30),
    q('SELECT game, COUNT(DISTINCT dev) AS players, SUM(secs) AS secs FROM plays WHERE day >= ? GROUP BY game', d7)
  ]);
  return { today: athensDay(now), from: d30, daily, modes, srcs, total, back, week };
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    const url = new URL(req.url);
    try {
      if (url.pathname === '/ping' && req.method === 'POST') {
        if (origin && !ALLOWED_ORIGINS.includes(origin)) return new Response(null, { status: 204 });
        const body = await req.text();
        if (body.length < 4000) await recordPing(env, body);
        return new Response(null, { status: 204, headers: cors });
      }
      if (url.pathname === '/dash' && req.method === 'GET') return new Response(DASH_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      if (url.pathname === '/stats' && req.method === 'POST') {
        if (!env.STATS_KEY) return json({ error: 'nokey' }, 503);
        const { key } = await req.json().catch(() => ({}));
        if (typeof key !== 'string' || key !== env.STATS_KEY) return json({ error: 'wrong key' }, 401);
        return json(await statsData(env));
      }
      if (url.pathname === '/health') return json({ ok: true, week: isoWeek(Date.now()) });

      if (url.pathname === '/nonce' && req.method === 'GET') {
        const addr = url.searchParams.get('addr') || '';
        if (!validAddr(addr)) return json({ error: 'bad address' }, 400);
        const nonce = randHex(16), now = Date.now();
        await env.DB.prepare('DELETE FROM nonces WHERE exp < ?').bind(now).run();
        await env.DB.prepare('INSERT INTO nonces (nonce, addr, exp) VALUES (?, ?, ?)').bind(nonce, addr, now + 10 * 60e3).run();
        return json({ nonce, message: signInMessage(addr, nonce, url.searchParams.get('game')) });
      }

      if (url.pathname === '/login' && req.method === 'POST') {
        const { addr, nonce, signature, game } = await req.json();
        if (!validAddr(addr) || typeof nonce !== 'string' || typeof signature !== 'string') return json({ error: 'bad request' }, 400);
        const row = await env.DB.prepare('SELECT addr, exp FROM nonces WHERE nonce = ?').bind(nonce).first();
        await env.DB.prepare('DELETE FROM nonces WHERE nonce = ?').bind(nonce).run();
        if (!row || row.addr !== addr || row.exp < Date.now()) return json({ error: 'sign-in expired, try again' }, 400);
        const ok = await verifyEd25519(b58decode(addr), b64decode(signature), new TextEncoder().encode(signInMessage(addr, nonce, game)));
        if (!ok) return json({ error: 'signature does not match this address' }, 401);
        const token = randHex(32);
        await env.DB.prepare('INSERT INTO sessions (token, addr, exp) VALUES (?, ?, ?)').bind(token, addr, Date.now() + SESSION_DAYS * 864e5).run();
        return json({ token, addr, seeker: await refreshSeeker(env, addr) });
      }

      if (url.pathname === '/score' && req.method === 'POST') {
        const { token, score, mode, game, board, value } = await req.json();
        const s = await env.DB.prepare('SELECT addr, exp, last FROM sessions WHERE token = ?').bind(String(token || '')).first();
        if (!s || s.exp < Date.now()) return json({ error: 'please sign in again' }, 401);
        if (game === 'bullrun') {
          const stored = bullrunCheck(board, value);
          if (stored === null) return json({ error: 'result not accepted' }, 400);
          const now = Date.now();
          if (now - s.last < MIN_GAP_MS) return json({ error: 'too fast' }, 429);
          await env.DB.prepare('UPDATE sessions SET last = ? WHERE token = ?').bind(now, token).run();
          const periods = board.startsWith('d:') ? [brPeriod(board, 'all')] : [brPeriod(board, isoWeek(now)), brPeriod(board, 'all')];
          for (const period of periods) {
            await env.DB.prepare(
              'INSERT INTO scores (addr, period, best, at) VALUES (?1, ?2, ?3, ?4) ' +
              'ON CONFLICT(addr, period) DO UPDATE SET best = excluded.best, at = excluded.at WHERE excluded.best > scores.best'
            ).bind(s.addr, period, stored, now).run();
          }
          const st = await standing(env, s.addr, periods[0]);
          return json({ ok: true, me: st.me ? { value: Math.abs(st.me.best), rank: st.me.rank } : null });
        }
        if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return json({ error: 'score not accepted' }, 400);
        const now = Date.now();
        if (now - s.last < MIN_GAP_MS) return json({ error: 'too fast' }, 429);
        await env.DB.prepare('UPDATE sessions SET last = ? WHERE token = ?').bind(now, token).run();
        const week = isoWeek(now);
        const periods = mode === 'daily' ? ['d-' + utcDay(now)] : [week, 'all'];   // daily challenge has its own board per UTC day
        for (const period of periods) {
          await env.DB.prepare(
            'INSERT INTO scores (addr, period, best, at) VALUES (?1, ?2, ?3, ?4) ' +
            'ON CONFLICT(addr, period) DO UPDATE SET best = excluded.best, at = excluded.at WHERE excluded.best > scores.best'
          ).bind(s.addr, period, score, now).run();
        }
        return json({ ok: true, ...(await standing(env, s.addr, periods[0])) });
      }

      if (url.pathname === '/top' && req.method === 'GET' && url.searchParams.get('game') === 'bullrun') {
        const board = url.searchParams.get('board') || 'endless';
        if (bullrunCheck(board, board === 'endless' ? 1 : 10 * 60e3) === null) return json({ error: 'unknown board' }, 400);
        const period = brPeriod(board, board.startsWith('d:') || url.searchParams.get('scope') === 'all' ? 'all' : isoWeek(Date.now()));
        await ensureSeekerTable(env);
        const top = await env.DB.prepare('SELECT s.addr, s.best, k.addr AS sk FROM scores s LEFT JOIN seekers k ON k.addr = s.addr WHERE s.period = ? ORDER BY s.best DESC, s.at ASC LIMIT 20').bind(period).all();
        const out = { board, top: (top.results || []).map(r => ({ addr: r.addr, value: Math.abs(r.best), seeker: !!r.sk })) };
        const addr = url.searchParams.get('addr');
        if (validAddr(addr || '')) { const st = await standing(env, addr, period); out.me = st.me ? { value: Math.abs(st.me.best), rank: st.me.rank } : null; }
        return json(out);
      }

      if (url.pathname === '/top' && req.method === 'GET') {
        const sc = url.searchParams.get('scope');
        const scope = sc === 'all' ? 'all' : sc === 'day' ? 'd-' + utcDay(Date.now()) : isoWeek(Date.now());
        const addr = url.searchParams.get('addr');
        await ensureSeekerTable(env);
        const top = await env.DB.prepare('SELECT s.addr, s.best, k.addr AS sk FROM scores s LEFT JOIN seekers k ON k.addr = s.addr WHERE s.period = ? ORDER BY s.best DESC, s.at ASC LIMIT 20').bind(scope).all();
        const out = { scope, top: (top.results || []).map(r => ({ addr: r.addr, best: r.best, seeker: !!r.sk })) };
        if (validAddr(addr || '')) Object.assign(out, await standing(env, addr, scope));
        return json(out);
      }

      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: 'server error' }, 500);
    }
  }
};

async function standing(env, addr, period) {
  const me = await env.DB.prepare('SELECT best, at FROM scores WHERE addr = ? AND period = ?').bind(addr, period).first();
  if (!me) return { me: null };
  const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE period = ? AND (best > ? OR (best = ? AND at < ?))').bind(period, me.best, me.best, me.at).first();
  return { me: { best: me.best, rank: (r ? r.n : 0) + 1 } };
}

function signInMessage(addr, nonce, game) {
  return (game === 'bullrun' ? 'StratoshiVibes Bull Run ranking sign-in\n\n' : 'StratoshiVibes Blockspace leaderboard sign-in\n\n') +
    'This is a sign-in, not a transaction. It costs nothing and cannot move any funds.\n\n' +
    'Address: ' + addr + '\nNonce: ' + nonce;
}

function utcDay(ms) { return new Date(ms).toISOString().slice(0, 10); }

function isoWeek(ms) {
  const d = new Date(ms); d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - day);
  const y = d.getUTCFullYear(), w = Math.ceil(((d - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return y + '-W' + String(w).padStart(2, '0');
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function validAddr(a) { return typeof a === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a) && b58decode(a).length === 32; }
function b58decode(s) {
  let n = 0n; for (const c of s) { const i = B58.indexOf(c); if (i < 0) return new Uint8Array(); n = n * 58n + BigInt(i); }
  const bytes = []; while (n > 0n) { bytes.unshift(Number(n & 255n)); n >>= 8n; }
  for (const c of s) { if (c === '1') bytes.unshift(0); else break; }
  return new Uint8Array(bytes);
}
function b64decode(s) { const bin = atob(s); return Uint8Array.from(bin, c => c.charCodeAt(0)); }
function randHex(n) { const b = new Uint8Array(n); crypto.getRandomValues(b); return [...b].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function verifyEd25519(pub, sig, msg) {
  if (pub.length !== 32 || sig.length !== 64) return false;
  for (const alg of [{ name: 'Ed25519' }, { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' }]) {
    try {
      const key = await crypto.subtle.importKey('raw', pub, alg, false, ['verify']);
      return await crypto.subtle.verify(alg, key, sig, msg);
    } catch (e) { /* try the next algorithm name */ }
  }
  return false;
}

// ---------- stats page (generated from dash.html by build-dash.py) ----------
const DASH_HTML = "<!doctype html>\n<html lang=\"el\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<meta name=\"robots\" content=\"noindex\">\n<title>Στατιστικά παιχνιδιών</title>\n<style>\n:root{color-scheme:light;--bg:#f4f4f1;--card:#fcfcfb;--line:#e2e1dc;--grid:#ecebe7;--ink:#0b0b0b;--ink2:#52514e;--muted:#7a7974;--accent:#6250d6;\n --s1:#2a78d6;--s2:#eb6834;--s3:#1baf7a}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){color-scheme:dark;--bg:#111110;--card:#1a1a19;--line:#2e2d2a;--grid:#262523;--ink:#f0efec;--ink2:#c3c2b7;--muted:#8f8e86;--accent:#9085e9;\n --s1:#3987e5;--s2:#d95926;--s3:#199e70}}\n:root[data-theme=\"dark\"]{color-scheme:dark;--bg:#111110;--card:#1a1a19;--line:#2e2d2a;--grid:#262523;--ink:#f0efec;--ink2:#c3c2b7;--muted:#8f8e86;--accent:#9085e9;--s1:#3987e5;--s2:#d95926;--s3:#199e70}\n*{box-sizing:border-box}\nbody{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,-apple-system,\"Segoe UI\",Roboto,sans-serif}\n.wrap{max-width:1040px;margin:0 auto;padding:20px 16px 48px}\nheader{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}\nh1{font-size:22px;margin:0}\nh2{font-size:16px;margin:0 0 4px}\n.sub{color:var(--muted);font-size:13px}\n.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:14px}\n.games{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px}\n@media (max-width:760px){.games{grid-template-columns:1fr}}\n.game h2{display:flex;align-items:center;gap:8px}\n.sw{width:10px;height:10px;border-radius:3px;flex:none}\n.hero{font-size:34px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1;margin-top:6px}\n.hero small{font-size:13px;font-weight:400;color:var(--ink2);margin-left:6px}\n.kv{display:grid;grid-template-columns:1fr auto;gap:4px 12px;margin-top:12px;font-size:13px;color:var(--ink2)}\n.kv b{color:var(--ink);font-variant-numeric:tabular-nums;font-weight:600;text-align:right}\n.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--ink2);margin:8px 0 4px}\n.legend span{display:inline-flex;align-items:center;gap:6px}\n.chart{position:relative}\n.chart svg{display:block;width:100%;height:auto;overflow:visible}\n.tip{position:absolute;pointer-events:none;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12px;box-shadow:0 6px 20px #0003;white-space:nowrap;display:none;z-index:2}\n.tip b{display:block;margin-bottom:4px;font-size:12px}\n.tip div{display:flex;align-items:center;gap:6px;color:var(--ink2)}\n.tip div i{width:8px;height:8px;border-radius:2px}\n.tip div em{font-style:normal;color:var(--ink);font-weight:600;margin-left:auto;padding-left:12px;font-variant-numeric:tabular-nums}\ntable{width:100%;border-collapse:collapse;font-size:13px}\nth,td{padding:7px 8px;border-bottom:1px solid var(--grid);text-align:right;font-variant-numeric:tabular-nums}\nth:first-child,td:first-child{text-align:left}\nth{color:var(--muted);font-weight:600;font-size:12px}\n.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}\n.tabs button{border:1px solid var(--line);background:transparent;color:var(--ink2);border-radius:99px;padding:5px 12px;font:inherit;font-size:13px;cursor:pointer}\n.tabs button[aria-pressed=\"true\"]{background:var(--ink);color:var(--card);border-color:var(--ink)}\n.bar{height:8px;border-radius:4px;background:var(--grid);overflow:hidden;min-width:60px}\n.bar i{display:block;height:100%;border-radius:4px}\nform{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}\ninput{flex:1;min-width:200px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit}\nbutton.main{padding:10px 16px;border-radius:10px;border:0;background:var(--accent);color:#fff;font:inherit;font-weight:600;cursor:pointer}\n.err{color:#e34948;font-size:13px;margin-top:8px}\n.note{font-size:12px;color:var(--muted);margin-top:10px}\n@media (max-width:600px){.barc{display:none}}\ndetails summary{cursor:pointer;color:var(--ink2);font-size:13px}\na{color:var(--accent)}\n.hide{display:none}\n</style>\n</head>\n<body>\n<div class=\"wrap\">\n<header><h1>Στατιστικά παιχνιδιών</h1><span class=\"sub\" id=\"upd\"></span></header>\n\n<div class=\"card\" id=\"login\">\n  <h2>Κωδικός</h2>\n  <div class=\"sub\">Γράψε τον κωδικό που έβαλες στο Cloudflare (STATS_KEY). Θα τον θυμάται αυτή η συσκευή.</div>\n  <form id=\"f\"><input id=\"k\" type=\"password\" autocomplete=\"current-password\" placeholder=\"Κωδικός\" required><button class=\"main\">Άνοιγμα</button></form>\n  <div class=\"err\" id=\"err\"></div>\n</div>\n\n<div id=\"main\" class=\"hide\">\n  <div class=\"games\" id=\"games\"></div>\n\n  <div class=\"card\">\n    <h2>Παίκτες ανά ημέρα</h2>\n    <div class=\"sub\">Διαφορετικές συσκευές που άνοιξαν κάθε παιχνίδι, τις τελευταίες 30 ημέρες (ώρα Ελλάδας)</div>\n    <div class=\"legend\" id=\"lg\"></div>\n    <div class=\"chart\" id=\"ch\"><div class=\"tip\" id=\"tip\"></div></div>\n    <details style=\"margin-top:10px\"><summary>Πίνακας με τα νούμερα</summary><div id=\"dtab\" style=\"overflow:auto;margin-top:8px\"></div></details>\n  </div>\n\n  <div class=\"card\">\n    <h2>Τι παίζουν</h2>\n    <div class=\"sub\">Τελευταίες 7 ημέρες</div>\n    <div class=\"tabs\" id=\"mt\"></div>\n    <div id=\"mtab\" style=\"overflow:auto\"></div>\n  </div>\n\n  <div class=\"card\">\n    <h2>Από πού παίζουν</h2>\n    <div class=\"sub\">Τελευταίες 30 ημέρες. «Εφαρμογή» είναι το APK από το dApp Store, οι υπόλοιποι παίζουν από browser.</div>\n    <div id=\"stab\" style=\"overflow:auto;margin-top:8px\"></div>\n  </div>\n\n  <p class=\"note\">Ανώνυμα στοιχεία: κάθε συσκευή έχει έναν τυχαίο αριθμό, χωρίς πορτοφόλι, ονόματα ή IP. Ο χρόνος μετράει μόνο όταν το παιχνίδι φαίνεται στην οθόνη. Αν κάποιος σβήσει τα δεδομένα του browser, μετράει ως νέος παίκτης. <a href=\"#\" id=\"out\">Αποσύνδεση</a></p>\n</div>\n</div>\n<script>\n(function(){\nconst G=[['bullrun','Bull Run','--s1'],['blockspace','Blockspace','--s2'],['arcade','Arcade','--s3']];\nconst MODE={menu:'Μενού',garage:'Γκαράζ',track:'Πίστες',endless:'Ατελείωτη διαδρομή',daily:'Καθημερινή πίστα',play:'Παιχνίδι',\n 'blockspace:daily':'Ημερήσια πρόκληση','blockspace:play':'Κανονικό παιχνίδι',lobby:'Αρχική',mahjong:'Mahjong','mahjong-daily':'Mahjong ημερήσιο',battlegrounds:'Battlegrounds',poker:'Rugpull Poker',rug:'Escape the Rug','rug-daily':'Escape ημερήσιο'};\nconst SRC={app:'Εφαρμογή (Seeker / Android)','app-seeker':'Εφαρμογή στο Seeker',android:'Browser σε Android','android-seeker':'Browser στο Seeker',ios:'Browser σε iPhone',desktop:'Υπολογιστής',other:'Άλλο'};\nconst $=id=>document.getElementById(id);\nconst nf=new Intl.NumberFormat('el-GR');\nconst mins=s=>{s=+s||0;if(s<60)return s+' δευτ.';const m=Math.round(s/60);if(m<60)return m+' λεπ.';const h=Math.floor(m/60);return h+' ώρ. '+(m%60)+' λεπ.'};\nconst css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();\nconst esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));\nlet key='';try{key=localStorage.getItem('sv_stats_key')||''}catch(e){}\nlet D=null,mg='bullrun';\n\nasync function load(){\n  $('err').textContent='';\n  try{\n    const r=await fetch('/stats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});\n    const j=await r.json();\n    if(j.error==='nokey'){$('err').textContent='Δεν έχει μπει ακόμα ο κωδικός STATS_KEY στο Cloudflare.';return show(false)}\n    if(!r.ok){$('err').textContent='Λάθος κωδικός.';try{localStorage.removeItem('sv_stats_key')}catch(e){}return show(false)}\n    try{localStorage.setItem('sv_stats_key',key)}catch(e){}\n    D=j;show(true);render();\n  }catch(e){$('err').textContent='Δεν ήταν δυνατή η σύνδεση. Δοκίμασε ξανά.';show(false)}\n}\nfunction show(ok){$('login').classList.toggle('hide',ok);$('main').classList.toggle('hide',!ok)}\n$('f').onsubmit=e=>{e.preventDefault();key=$('k').value.trim();load()};\n$('out').onclick=e=>{e.preventDefault();try{localStorage.removeItem('sv_stats_key')}catch(x){}key='';show(false)};\n\nfunction days(){const out=[];const [y,m,d]=D.today.split('-').map(Number);const t=Date.UTC(y,m-1,d);for(let i=29;i>=0;i--)out.push(new Date(t-i*864e5).toISOString().slice(0,10));return out}\nconst by=(arr,g)=>arr.filter(r=>r.game===g);\nfunction render(){\n  $('upd').textContent='Ενημέρωση: '+new Date().toLocaleTimeString('el-GR',{hour:'2-digit',minute:'2-digit'});\n  // per-game cards\n  $('games').innerHTML=G.map(([g,name,c])=>{\n    const td=D.daily.find(r=>r.game===g&&r.day===D.today)||{};\n    const wk=D.week.find(r=>r.game===g)||{},tot=D.total.find(r=>r.game===g)||{},bk=D.back.find(r=>r.game===g)||{};\n    const avg=wk.players?Math.round(wk.secs/wk.players):0;\n    return `<div class=\"card game\"><h2><i class=\"sw\" style=\"background:var(${c})\"></i>${name}</h2>\n      <div class=\"hero\">${nf.format(td.players||0)}<small>παίκτες σήμερα</small></div>\n      <div class=\"kv\"><span>Έπαιξαν σήμερα (όχι μόνο μενού)</span><b>${nf.format(td.gamers||0)}</b>\n      <span>Χρόνος σήμερα</span><b>${mins(td.secs)}</b>\n      <span>Παίκτες, 7 ημέρες</span><b>${nf.format(wk.players||0)}</b>\n      <span>Χρόνος ανά παίκτη, 7 ημέρες</span><b>${mins(avg)}</b>\n      <span>Ξαναήρθαν (2+ μέρες), 30 ημέρες</span><b>${nf.format(bk.players||0)}</b>\n      <span>Όλοι οι παίκτες${tot.since?' από '+tot.since.split('-').reverse().join('/'):''}</span><b>${nf.format(tot.players||0)}</b>\n      <span>Συνολικός χρόνος</span><b>${mins(tot.secs)}</b></div></div>`}).join('');\n  chart();modes();srcs();\n}\nfunction chart(){\n  const ds=days(),W=Math.max(300,Math.round($('ch').clientWidth||960)),H=W<600?220:260,L=32,R=14,T=12,B=28,iw=W-L-R,ih=H-T-B;\n  const val=(g,d)=>{const r=D.daily.find(x=>x.game===g&&x.day===d);return r?r.players:0};\n  const max=Math.max(4,...G.flatMap(([g])=>ds.map(d=>val(g,d))));\n  const step=max<=10?2:max<=50?10:max<=200?50:Math.pow(10,Math.floor(Math.log10(max)));const top=Math.ceil(max/step)*step;\n  const x=i=>L+iw*i/(ds.length-1),y=v=>T+ih*(1-v/top);\n  let s=`<svg viewBox=\"0 0 ${W} ${H}\" role=\"img\" aria-label=\"Παίκτες ανά ημέρα για κάθε παιχνίδι\">`;\n  for(let v=0;v<=top;v+=step)s+=`<line x1=\"${L}\" x2=\"${W-R}\" y1=\"${y(v)}\" y2=\"${y(v)}\" stroke=\"var(--grid)\" stroke-width=\"1\"/><text x=\"${L-6}\" y=\"${y(v)+4}\" text-anchor=\"end\" font-size=\"11\" fill=\"var(--muted)\">${v}</text>`;\n  const ev=W<600?10:5;ds.forEach((d,i)=>{if((ds.length-1-i)%ev===0)s+=`<text x=\"${x(i)}\" y=\"${H-8}\" text-anchor=\"${i===ds.length-1?'end':'middle'}\" font-size=\"11\" fill=\"var(--muted)\">${d.slice(8)}/${d.slice(5,7)}</text>`});\n  for(const [g,,c] of G){const pts=ds.map((d,i)=>x(i).toFixed(1)+','+y(val(g,d)).toFixed(1)).join(' ');\n    s+=`<polyline points=\"${pts}\" fill=\"none\" stroke=\"var(${c})\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>`;}\n  s+=`<line id=\"xh\" x1=\"0\" x2=\"0\" y1=\"${T}\" y2=\"${T+ih}\" stroke=\"var(--muted)\" stroke-width=\"1\" stroke-dasharray=\"3 3\" visibility=\"hidden\"/>`;\n  for(const [g,,c] of G)s+=`<circle class=\"dot\" data-g=\"${g}\" r=\"4\" fill=\"var(${c})\" stroke=\"var(--card)\" stroke-width=\"2\" visibility=\"hidden\"/>`;\n  s+=`<rect x=\"${L}\" y=\"${T}\" width=\"${iw}\" height=\"${ih}\" fill=\"transparent\" id=\"hit\"/></svg>`;\n  const ch=$('ch');ch.querySelector('svg')&&ch.querySelector('svg').remove();ch.insertAdjacentHTML('beforeend',s);\n  $('lg').innerHTML=G.map(([,n,c])=>`<span><i class=\"sw\" style=\"background:var(${c})\"></i>${n}</span>`).join('');\n  const svg=ch.querySelector('svg'),tip=$('tip'),xh=svg.querySelector('#xh');\n  function at(ev){const r=svg.getBoundingClientRect();const px=(ev.clientX-r.left)*W/r.width;const i=Math.max(0,Math.min(ds.length-1,Math.round((px-L)/iw*(ds.length-1))));\n    xh.setAttribute('x1',x(i));xh.setAttribute('x2',x(i));xh.setAttribute('visibility','visible');\n    svg.querySelectorAll('.dot').forEach(c=>{c.setAttribute('cx',x(i));c.setAttribute('cy',y(val(c.dataset.g,ds[i])));c.setAttribute('visibility','visible')});\n    const d=ds[i];tip.innerHTML=`<b>${d.slice(8)}/${d.slice(5,7)}/${d.slice(0,4)}</b>`+G.map(([g,n,c])=>`<div><i style=\"background:var(${c})\"></i>${n}<em>${val(g,d)}</em></div>`).join('');\n    tip.style.display='block';const left=x(i)*r.width/W;const tw=tip.offsetWidth;tip.style.left=Math.min(Math.max(0,left+12+tw>r.width?left-tw-12:left+12),r.width-tw)+'px';tip.style.top='10px';}\n  const off=()=>{tip.style.display='none';xh.setAttribute('visibility','hidden');svg.querySelectorAll('.dot').forEach(c=>c.setAttribute('visibility','hidden'))};\n  const hit=svg.querySelector('#hit');hit.addEventListener('pointermove',at);hit.addEventListener('pointerdown',at);hit.addEventListener('pointerleave',off);\n  $('dtab').innerHTML=`<table><thead><tr><th>Ημέρα</th>${G.map(([,n])=>`<th>${n}: παίκτες</th><th>χρόνος</th>`).join('')}</tr></thead><tbody>${ds.slice().reverse().map(d=>`<tr><td>${d.split('-').reverse().join('/')}</td>${G.map(([g])=>{const r=D.daily.find(x=>x.game===g&&x.day===d)||{};return `<td>${r.players||0}</td><td>${mins(r.secs)}</td>`}).join('')}</tr>`).join('')}</tbody></table>`;\n}\nfunction modes(){\n  $('mt').innerHTML=G.map(([g,n])=>`<button data-g=\"${g}\" aria-pressed=\"${g===mg}\">${n}</button>`).join('');\n  $('mt').querySelectorAll('button').forEach(b=>b.onclick=()=>{mg=b.dataset.g;modes()});\n  const c=G.find(x=>x[0]===mg)[2];\n  const rows=by(D.modes,mg).sort((a,b)=>b.secs-a.secs);const mx=Math.max(1,...rows.map(r=>r.secs));\n  $('mtab').innerHTML=rows.length?`<table><thead><tr><th>Λειτουργία</th><th>Παίκτες</th><th>Συνολικός χρόνος</th><th>Ανά παίκτη</th><th class=\"barc\" style=\"width:30%\"></th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(MODE[mg+':'+r.mode]||MODE[r.mode]||r.mode)}</td><td>${nf.format(r.players)}</td><td>${mins(r.secs)}</td><td>${mins(Math.round(r.secs/r.players))}</td><td class=\"barc\"><div class=\"bar\"><i style=\"width:${Math.max(2,100*r.secs/mx)}%;background:var(${c})\"></i></div></td></tr>`).join('')}</tbody></table>`:'<p class=\"sub\">Δεν υπάρχουν ακόμα στοιχεία.</p>';\n}\nfunction srcs(){\n  const keys=[...new Set(D.srcs.map(r=>r.src))].sort();\n  $('stab').innerHTML=keys.length?`<table><thead><tr><th>Από πού</th>${G.map(([,n])=>`<th>${n}</th>`).join('')}</tr></thead><tbody>${keys.map(k=>`<tr><td>${esc(SRC[k]||k)}</td>${G.map(([g])=>{const r=D.srcs.find(x=>x.game===g&&x.src===k);return `<td>${r?nf.format(r.players):'–'}</td>`}).join('')}</tr>`).join('')}</tbody></table>`:'<p class=\"sub\">Δεν υπάρχουν ακόμα στοιχεία.</p>';\n}\nif(key)load();else show(false);\nlet rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(D)chart()},150)});\nsetInterval(()=>{if(D&&key&&document.visibilityState==='visible')load()},120000);\n})();\n</script>\n</body>\n</html>\n";
