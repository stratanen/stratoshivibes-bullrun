/* Rollway live rooms: up to 4 players race together. One Durable Object per room code.
   The room only relays positions between players; it stores nothing about them after the room empties. */
import { DurableObject } from 'cloudflare:workers';

const MAX = 4, RACE_MAX_MS = 8 * 60 * 1000;
const ALLOWED = /^https:\/\/(bullrun\.stratoshivibes\.com|localhost(:\d+)?)$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/health') return json({ ok: true });
    const m = u.pathname.match(/^\/room\/([A-Z0-9]{5})$/);
    if (!m) return json({ error: 'not found' }, 404);
    if (req.headers.get('Upgrade') !== 'websocket') return json({ error: 'expected websocket' }, 426);
    const origin = req.headers.get('Origin') || '';
    if (origin && !ALLOWED.test(origin)) return json({ error: 'origin' }, 403);
    const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1]));
    return stub.fetch(req);
  }
};

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const hexOk = h => /^#[0-9a-fA-F]{6}$/.test(h) ? h : '#ff3a5c';

export class Room extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.ctx = ctx; }

  socks() { return this.ctx.getWebSockets().map(ws => ({ ws, a: ws.deserializeAttachment() })).filter(x => x.a && x.a.id); }
  async meta() { return (await this.ctx.storage.get('meta')) || null; }
  async save(m) { await this.ctx.storage.put('meta', m); }
  send(ws, o) { try { ws.send(JSON.stringify(o)); } catch (e) {} }

  async fetch(req) {
    const create = new URL(req.url).searchParams.get('create') === '1';
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    let meta = await this.meta();
    const now = Date.now();
    if (meta && meta.phase === 'race' && now - meta.at > RACE_MAX_MS) { meta.phase = 'lobby'; await this.save(meta); }
    if (!meta) {
      if (!create) { this.send(server, { t: 'err', e: 'gone' }); server.close(4004, 'gone'); return new Response(null, { status: 101, webSocket: client }); }
      meta = { track: 0, phase: 'lobby', host: null, at: 0, fin: {} }; await this.save(meta);
    }
    const list = this.socks();
    if (list.length >= MAX || meta.phase === 'race') { this.send(server, { t: 'err', e: 'full' }); server.close(4009, 'full'); return new Response(null, { status: 101, webSocket: client }); }
    const used = new Set(list.map(x => x.a.slot)); let slot = 0; while (used.has(slot)) slot++;
    const id = crypto.randomUUID().slice(0, 8);
    server.serializeAttachment({ id, slot, name: 'Player', hex: '#ff3a5c', ready: false });
    return new Response(null, { status: 101, webSocket: client });
  }

  async broadcastRoom(meta) {
    const list = this.socks(), players = list.filter(x => x.a.ready).map(x => ({ id: x.a.id, name: x.a.name, hex: x.a.hex, slot: x.a.slot })), now = Date.now();
    for (const x of list) this.send(x.ws, { t: 'room', you: x.a.id, host: meta.host, players, track: meta.track, phase: meta.phase, now });
  }

  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const a = ws.deserializeAttachment(); if (!a) return;
    if (m.t === 'st') {   // positions: relayed straight to the others, never stored
      const out = JSON.stringify({ t: 'st', id: a.id, rt: +m.rt || 0, s: +m.s || 0, d: +m.d || 0, h: +m.h || 0, v: +m.v || 0 });
      for (const x of this.socks()) if (x.a.id !== a.id) { try { x.ws.send(out); } catch (e) {} }
      return;
    }
    const meta = await this.meta(); if (!meta) return;
    if (m.t === 'hello') {
      a.name = clean(m.name, 14) || 'Player'; a.hex = hexOk(m.hex); a.ready = true; ws.serializeAttachment(a);
      if (!meta.host || !this.socks().some(x => x.a.id === meta.host)) meta.host = a.id;
      await this.save(meta); return this.broadcastRoom(meta);
    }
    if (m.t === 'track' && a.id === meta.host && meta.phase === 'lobby') { const tr = Math.round(+m.track); if (tr >= 0 && tr < 20) { meta.track = tr; await this.save(meta); return this.broadcastRoom(meta); } return; }
    if (m.t === 'go' && a.id === meta.host && meta.phase === 'lobby') {
      const list = this.socks().filter(x => x.a.ready); if (list.length < 2) return;
      meta.phase = 'race'; meta.at = Date.now() + 4000; meta.fin = {}; await this.save(meta);
      const players = list.map(x => ({ id: x.a.id, name: x.a.name, hex: x.a.hex, slot: x.a.slot })), now = Date.now();
      for (const x of list) this.send(x.ws, { t: 'start', at: meta.at, track: meta.track, players, now });
      return;
    }
    if (m.t === 'fin' && meta.phase === 'race') {
      meta.fin[a.id] = m.time == null ? null : +m.time;
      const out = { t: 'fin', id: a.id, time: m.time == null ? null : +m.time, s: +m.s || 0 };
      for (const x of this.socks()) if (x.a.id !== a.id) this.send(x.ws, out);
      if (this.socks().every(x => x.a.id in meta.fin)) { meta.phase = 'lobby'; await this.save(meta); return this.broadcastRoom(meta); }
      await this.save(meta); return;
    }
    if (m.t === 'back') { if (meta.phase === 'race' && Date.now() - meta.at > RACE_MAX_MS) meta.phase = 'lobby'; await this.save(meta); return this.broadcastRoom(meta); }
  }

  async webSocketClose(ws) { await this.left(ws); }
  async webSocketError(ws) { await this.left(ws); }
  async left(ws) {
    try { ws.close(1000, 'bye'); } catch (e) {}
    const meta = await this.meta(); if (!meta) return;
    const rest = this.socks().filter(x => x.ws !== ws);
    if (!rest.length) { await this.ctx.storage.deleteAll(); return; }
    if (!rest.some(x => x.a.id === meta.host)) meta.host = rest[0].a.id;
    if (meta.phase === 'race' && rest.every(x => x.a.id in meta.fin)) meta.phase = 'lobby';
    await this.save(meta);
    const list = rest, players = list.filter(x => x.a.ready).map(x => ({ id: x.a.id, name: x.a.name, hex: x.a.hex, slot: x.a.slot })), now = Date.now();
    for (const x of list) this.send(x.ws, { t: 'room', you: x.a.id, host: meta.host, players, track: meta.track, phase: meta.phase, now });
  }
}
