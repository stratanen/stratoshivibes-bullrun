// StratoshiVibes leaderboard (Blockspace and Bull Run), a Cloudflare Worker with a D1 database bound as DB.
// Players sign in once by signing a plain message with their wallet (no transaction, no fees).
// The worker checks the ed25519 signature, then accepts end-of-game scores from that address.

const ALLOWED_ORIGINS = ['https://blockspace.stratoshivibes.com', 'https://bullrun.stratoshivibes.com', 'https://stratanen.github.io'];

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
const MAX_SCORE = 5000000;         // anything above is treated as tampering (scores are 10x since Oct 2026)
const MIN_GAP_MS = 15000;          // at most one score every 15 seconds per player
const SESSION_DAYS = 60;

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
        return json({ token, addr });
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
        const top = await env.DB.prepare('SELECT addr, best FROM scores WHERE period = ? ORDER BY best DESC, at ASC LIMIT 20').bind(period).all();
        const out = { board, top: (top.results || []).map(r => ({ addr: r.addr, value: Math.abs(r.best) })) };
        const addr = url.searchParams.get('addr');
        if (validAddr(addr || '')) { const st = await standing(env, addr, period); out.me = st.me ? { value: Math.abs(st.me.best), rank: st.me.rank } : null; }
        return json(out);
      }

      if (url.pathname === '/top' && req.method === 'GET') {
        const sc = url.searchParams.get('scope');
        const scope = sc === 'all' ? 'all' : sc === 'day' ? 'd-' + utcDay(Date.now()) : isoWeek(Date.now());
        const addr = url.searchParams.get('addr');
        const top = await env.DB.prepare('SELECT addr, best FROM scores WHERE period = ? ORDER BY best DESC, at ASC LIMIT 20').bind(scope).all();
        const out = { scope, top: top.results || [] };
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
