/* ================= rivals: ghosts, challenge links, live races with friends, rear-view mirror =================
   A rival is another car on the same track: a recorded run (your best, or a friend's challenge) or a live
   player in the same room. Rivals pass through you and through traffic: no collisions, so a slow network can
   never cause an unfair crash. */
const RV_TXT = {
  el: { friends:'Με φίλους', friendsSub:'Ζωντανός αγώνας ή πρόκληση', liveTitle:'Ζωντανός αγώνας', liveSub:'2–3 παίκτες ξεκινάτε μαζί, πλάι πλάι', chTitle:'Πρόκληση με φάντασμα', chSub:'Τρέξε μια πίστα και στείλε τον χρόνο σου σε φίλο',
    challenge:'Πρόκληση σε φίλο', challengeTitle:'Πρόκληση!', challengeMsg:'{n} σε προκαλεί στην πίστα {tr} με χρόνο {t}. Θα τρέξεις δίπλα στο φάντασμά του.', raceIt:'Αγώνας!', later:'Αργότερα', expired:'Αυτή η πρόκληση δεν διαβάζεται.',
    myBest:'Το ρεκόρ σου', pos:'Θέση', results:'Κατάταξη', you:'Εσύ', dnf:'δεν τερμάτισε', ghostOpt:'Φάντασμα ρεκόρ', mirrorOpt:'Καθρέφτης',
    yourName:'Το όνομά σου', roomCreate:'Νέο δωμάτιο', roomJoin:'Μπες με κωδικό', roomCode:'Κωδικός δωματίου', roomWait:'Περιμένουμε παίκτες…', roomStart:'Ξεκίνα τον αγώνα', roomShare:'Στείλε πρόσκληση',
    roomFull:'Το δωμάτιο είναι γεμάτο.', roomGone:'Δεν βρέθηκε δωμάτιο με αυτόν τον κωδικό.', roomOff:'Ο ζωντανός αγώνας δεν είναι διαθέσιμος αυτή τη στιγμή. Δοκίμασε σε λίγο.', roomHost:'οικοδεσπότης', roomLeft:'αποχώρησε',
    pickTrack:'Πίστα', waitHost:'Ο οικοδεσπότης θα ξεκινήσει τον αγώνα.', need2:'Χρειάζεται τουλάχιστον ένας ακόμα παίκτης.', invite:'Έλα να τρέξουμε μαζί στο Rollway! Κωδικός: {c}', challengeText:'Νίκησε τον χρόνο μου στο Rollway: {t} στην πίστα {tr}', leave:'Έξοδος', again:'Ξανά στο δωμάτιο', live:'LIVE', noPause:'Στον ζωντανό αγώνα δεν υπάρχει παύση.' },
  en: { friends:'With friends', friendsSub:'Live race or challenge', liveTitle:'Live race', liveSub:'2–3 players start together, side by side', chTitle:'Ghost challenge', chSub:'Race a track and send your time to a friend',
    challenge:'Challenge a friend', challengeTitle:'Challenge!', challengeMsg:'{n} challenges you on {tr} with a time of {t}. You will race next to their ghost.', raceIt:'Race!', later:'Later', expired:'This challenge cannot be read.',
    myBest:'Your best', pos:'Pos', results:'Standings', you:'You', dnf:'did not finish', ghostOpt:'Best-run ghost', mirrorOpt:'Mirror',
    yourName:'Your name', roomCreate:'New room', roomJoin:'Join with a code', roomCode:'Room code', roomWait:'Waiting for players…', roomStart:'Start the race', roomShare:'Send invite',
    roomFull:'The room is full.', roomGone:'No room found with this code.', roomOff:'Live racing is not available right now. Try again shortly.', roomHost:'host', roomLeft:'left',
    pickTrack:'Track', waitHost:'The host will start the race.', need2:'At least one more player is needed.', invite:'Come race with me on Rollway! Code: {c}', challengeText:'Beat my Rollway time: {t} on {tr}', leave:'Leave', again:'Back to the room', live:'LIVE', noPause:'There is no pause in a live race.' },
  es: { friends:'Con amigos', friendsSub:'Carrera en vivo o reto', liveTitle:'Carrera en vivo', liveSub:'2–3 jugadores salen juntos, lado a lado', chTitle:'Reto con fantasma', chSub:'Corre una pista y envía tu tiempo a un amigo',
    challenge:'Retar a un amigo', challengeTitle:'¡Reto!', challengeMsg:'{n} te reta en {tr} con un tiempo de {t}. Correrás junto a su fantasma.', raceIt:'¡A correr!', later:'Más tarde', expired:'No se puede leer este reto.',
    myBest:'Tu récord', pos:'Pos', results:'Clasificación', you:'Tú', dnf:'no terminó', ghostOpt:'Fantasma del récord', mirrorOpt:'Retrovisor',
    yourName:'Tu nombre', roomCreate:'Nueva sala', roomJoin:'Entrar con código', roomCode:'Código de sala', roomWait:'Esperando jugadores…', roomStart:'Empezar la carrera', roomShare:'Enviar invitación',
    roomFull:'La sala está llena.', roomGone:'No hay ninguna sala con este código.', roomOff:'La carrera en vivo no está disponible ahora. Inténtalo en un rato.', roomHost:'anfitrión', roomLeft:'salió',
    pickTrack:'Pista', waitHost:'El anfitrión empezará la carrera.', need2:'Hace falta al menos un jugador más.', invite:'¡Ven a correr conmigo en Rollway! Código: {c}', challengeText:'Supera mi tiempo en Rollway: {t} en {tr}', leave:'Salir', again:'Volver a la sala', live:'EN VIVO', noPause:'En una carrera en vivo no hay pausa.' },
  pt: { friends:'Com amigos', friendsSub:'Corrida ao vivo ou desafio', liveTitle:'Corrida ao vivo', liveSub:'2–3 jogadores largam juntos, lado a lado', chTitle:'Desafio com fantasma', chSub:'Corra uma pista e envie seu tempo a um amigo',
    challenge:'Desafiar um amigo', challengeTitle:'Desafio!', challengeMsg:'{n} desafia você em {tr} com o tempo {t}. Você vai correr ao lado do fantasma dele.', raceIt:'Correr!', later:'Depois', expired:'Não foi possível ler este desafio.',
    myBest:'Seu recorde', pos:'Pos', results:'Classificação', you:'Você', dnf:'não terminou', ghostOpt:'Fantasma do recorde', mirrorOpt:'Retrovisor',
    yourName:'Seu nome', roomCreate:'Nova sala', roomJoin:'Entrar com código', roomCode:'Código da sala', roomWait:'Aguardando jogadores…', roomStart:'Começar a corrida', roomShare:'Enviar convite',
    roomFull:'A sala está cheia.', roomGone:'Nenhuma sala com este código.', roomOff:'A corrida ao vivo não está disponível agora. Tente daqui a pouco.', roomHost:'anfitrião', roomLeft:'saiu',
    pickTrack:'Pista', waitHost:'O anfitrião vai começar a corrida.', need2:'Falta pelo menos mais um jogador.', invite:'Vem correr comigo no Rollway! Código: {c}', challengeText:'Bata meu tempo no Rollway: {t} em {tr}', leave:'Sair', again:'Voltar à sala', live:'AO VIVO', noPause:'Não há pausa numa corrida ao vivo.' },
  de: { friends:'Mit Freunden', friendsSub:'Live-Rennen oder Herausforderung', liveTitle:'Live-Rennen', liveSub:'2–3 Spieler starten gemeinsam, Seite an Seite', chTitle:'Geister-Herausforderung', chSub:'Fahre eine Strecke und schick deine Zeit an Freunde',
    challenge:'Freund herausfordern', challengeTitle:'Herausforderung!', challengeMsg:'{n} fordert dich auf {tr} mit {t} heraus. Du fährst neben dem Geist.', raceIt:'Los!', later:'Später', expired:'Diese Herausforderung kann nicht gelesen werden.',
    myBest:'Deine Bestzeit', pos:'Pos', results:'Wertung', you:'Du', dnf:'nicht im Ziel', ghostOpt:'Bestzeit-Geist', mirrorOpt:'Rückspiegel',
    yourName:'Dein Name', roomCreate:'Neuer Raum', roomJoin:'Mit Code beitreten', roomCode:'Raumcode', roomWait:'Warte auf Spieler…', roomStart:'Rennen starten', roomShare:'Einladung senden',
    roomFull:'Der Raum ist voll.', roomGone:'Kein Raum mit diesem Code.', roomOff:'Live-Rennen sind gerade nicht verfügbar. Versuch es gleich noch mal.', roomHost:'Gastgeber', roomLeft:'hat verlassen',
    pickTrack:'Strecke', waitHost:'Der Gastgeber startet das Rennen.', need2:'Es fehlt noch mindestens ein Spieler.', invite:'Fahr mit mir bei Rollway! Code: {c}', challengeText:'Schlag meine Rollway-Zeit: {t} auf {tr}', leave:'Verlassen', again:'Zurück in den Raum', live:'LIVE', noPause:'Im Live-Rennen gibt es keine Pause.' },
  fr: { friends:'Entre amis', friendsSub:'Course en direct ou défi', liveTitle:'Course en direct', liveSub:'2–3 joueurs partent ensemble, côte à côte', chTitle:'Défi fantôme', chSub:'Faites une piste et envoyez votre temps à un ami',
    challenge:'Défier un ami', challengeTitle:'Défi !', challengeMsg:'{n} vous défie sur {tr} avec un temps de {t}. Vous courrez à côté de son fantôme.', raceIt:'En course !', later:'Plus tard', expired:'Ce défi est illisible.',
    myBest:'Votre record', pos:'Pos', results:'Classement', you:'Vous', dnf:'non classé', ghostOpt:'Fantôme du record', mirrorOpt:'Rétroviseur',
    yourName:'Votre nom', roomCreate:'Nouvelle salle', roomJoin:'Rejoindre avec un code', roomCode:'Code de la salle', roomWait:'En attente de joueurs…', roomStart:'Lancer la course', roomShare:'Envoyer l’invitation',
    roomFull:'La salle est pleine.', roomGone:'Aucune salle avec ce code.', roomOff:'La course en direct n’est pas disponible pour le moment. Réessayez bientôt.', roomHost:'hôte', roomLeft:'est parti',
    pickTrack:'Piste', waitHost:'L’hôte lancera la course.', need2:'Il faut au moins un autre joueur.', invite:'Viens faire la course avec moi sur Rollway ! Code : {c}', challengeText:'Bats mon temps sur Rollway : {t} sur {tr}', leave:'Quitter', again:'Retour à la salle', live:'DIRECT', noPause:'Pas de pause en course en direct.' },
  tr: { friends:'Arkadaşlarla', friendsSub:'Canlı yarış veya meydan okuma', liveTitle:'Canlı yarış', liveSub:'2–3 oyuncu yan yana birlikte başlar', chTitle:'Hayalet meydan okuması', chSub:'Bir parkur koş ve süreni arkadaşına gönder',
    challenge:'Arkadaşına meydan oku', challengeTitle:'Meydan okuma!', challengeMsg:'{n}, {tr} parkurunda {t} süresiyle sana meydan okuyor. Hayaletinin yanında yarışacaksın.', raceIt:'Yarış!', later:'Sonra', expired:'Bu meydan okuma okunamıyor.',
    myBest:'Rekorun', pos:'Sıra', results:'Sıralama', you:'Sen', dnf:'bitiremedi', ghostOpt:'Rekor hayaleti', mirrorOpt:'Ayna',
    yourName:'Adın', roomCreate:'Yeni oda', roomJoin:'Kodla katıl', roomCode:'Oda kodu', roomWait:'Oyuncular bekleniyor…', roomStart:'Yarışı başlat', roomShare:'Davet gönder',
    roomFull:'Oda dolu.', roomGone:'Bu kodla oda bulunamadı.', roomOff:'Canlı yarış şu an kullanılamıyor. Biraz sonra tekrar dene.', roomHost:'ev sahibi', roomLeft:'ayrıldı',
    pickTrack:'Parkur', waitHost:'Yarışı ev sahibi başlatacak.', need2:'En az bir oyuncu daha gerekli.', invite:'Rollway’de benimle yarış! Kod: {c}', challengeText:'Rollway süremi geç: {tr} parkurunda {t}', leave:'Çık', again:'Odaya dön', live:'CANLI', noPause:'Canlı yarışta duraklatma yok.' }
};
for (const l of LANGS) Object.assign(T[l], RV_TXT[l] || {});
const RT_ = () => T[lang];
const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => o[k] != null ? o[k] : '');

/* ---------- settings ---------- */
let ghostOn = store.get('bullrun_ghost') !== '0';
let mirrorPref = store.get('bullrun_mirror');   // 'on' | 'off' | null = by graphics level
const mirrorOn = () => mirrorPref === 'on' || (mirrorPref !== 'off' && gfxLevel >= 2);
let myName = (store.get('bullrun_name') || '').slice(0, 14);

/* ---------- rival cars ---------- */
const RIVAL_COLS = ['#2ec8ff', '#ffd04a', '#b47bff', '#5ff5bf', '#ff8a3a'];
let rivals = [];
const ghostMats = new Map();
function ghostMat(hex){ if (!ghostMats.has(hex)) { const m = carMats(hex).map(x => { const c = x.clone(); c.transparent = true; c.opacity = .5; c.depthWrite = false; return c; }); ghostMats.set(hex, m); } return ghostMats.get(hex); }
const rvPool = [];
function rvMesh(hex, solid){ let m = rvPool.find(x => !x.visible); if (!m) { m = new THREE.Mesh(CAR_GEO.sport, carMats(hex)); scene.add(m); rvPool.push(m); } m.material = solid ? carMats(hex) : ghostMat(hex); m.castShadow = !!solid; m.visible = true; return m; }
function rvTag(r){ const el = document.createElement('div'); el.className = 'rvtag'; el.textContent = r.name; el.style.setProperty('--c', r.hex); document.body.appendChild(el); return el; }
function rvClear(){ for (const r of rivals) { if (r.mesh) r.mesh.visible = false; if (r.tag) r.tag.remove(); } rivals = []; const p = $('hPos'); if (p) p.hidden = true; }
function rvAdd(o){ const r = { s: 60, d: 0, h: 0, fin: null, ...o }; r.mesh = rvMesh(r.hex, r.kind === 'net'); r.tag = rvTag(r); rivals.push(r); return r; }

/* where a recorded rival is at race time t (samples every 0.1 s) */
function ghostAt(g, t){
  const n = g.S.length, x = t * GH_HZ, i = Math.floor(x);
  if (i >= n - 1) return { s: g.S[n - 1], d: g.D[n - 1], h: 0, done: true };
  const f = x - i; return { s: g.S[i] + (g.S[i + 1] - g.S[i]) * f, d: g.D[i] + (g.D[i + 1] - g.D[i]) * f, h: g.H[i] + (g.H[i + 1] - g.H[i]) * f, done: false };
}
/* a live rival is drawn 0.15 s behind, between the two samples around that moment, so movement stays smooth */
function netAt(r, t){
  const b = r.buf; if (!b.length) return { s: r.s, d: r.d, h: 0 };
  const tt = t - .15; let j = b.length - 1; while (j > 0 && b[j - 1].rt > tt) j--;
  const A = b[Math.max(0, j - 1)], B = b[j]; if (!A || B.rt <= A.rt || tt >= B.rt) return { s: B.s + (tt > B.rt ? Math.min(.5, tt - B.rt) * B.v : 0), d: B.d, h: B.h };
  const f = clamp((tt - A.rt) / (B.rt - A.rt), 0, 1); return { s: A.s + (B.s - A.s) * f, d: A.d + (B.d - A.d) * f, h: A.h + (B.h - A.h) * f };
}

/* ---------- recording ---------- */
const GH_HZ = 10;
let ghRec = null;
function rvTick(dt){
  if (mode !== 'track') return;
  if (ghRec && !isDaily()) while (ghRec.S.length <= raceT * GH_HZ) { ghRec.S.push(sP); ghRec.D.push(d); ghRec.H.push(flyH); }
  if (NET.on && state === 'race') { NET.acc += dt; if (NET.acc >= .1) { NET.acc = 0; netSend({ t: 'st', rt: +raceT.toFixed(2), s: +sP.toFixed(1), d: +d.toFixed(2), h: +flyH.toFixed(1), v: +v.toFixed(1) }); } }
}

/* ---------- challenge codes: the whole run in the link, nothing stored on a server ---------- */
const b64u = u8 => { let s = ''; for (const x of u8) s += String.fromCharCode(x); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
async function zip(u8, back){ const CS = back ? window.DecompressionStream : window.CompressionStream; if (!CS) return null; const st = new Blob([u8]).stream().pipeThrough(new CS('deflate-raw')); return new Uint8Array(await new Response(st).arrayBuffer()); }
async function ghEncode(g){
  const out = [], vb = x => { x = x < 0 ? (-x << 1) - 1 : x << 1; while (x > 127) { out.push((x & 127) | 128); x >>>= 7; } out.push(x); };
  const nm = new TextEncoder().encode((g.name || '').slice(0, 14)), tms = Math.round(g.t * 1000);
  out.push(g.track & 255, tms & 255, (tms >> 8) & 255, (tms >> 16) & 255, Math.max(0, PAINTS.findIndex(p => p.id === g.paint)) & 255, nm.length, ...nm);
  vb(g.S.length); let ps = 0, pd = 0, ph = 0;
  for (let i = 0; i < g.S.length; i++) { const s = Math.round(g.S[i] * 10), dd = Math.round(g.D[i] * 50), h = Math.round(g.H[i] * 10); vb(s - ps); vb(dd - pd); vb(h - ph); ps = s; pd = dd; ph = h; }
  const raw = new Uint8Array(out); let z = null; try { z = await zip(raw); } catch (e) {}
  return z && z.length < raw.length ? 'z' + b64u(z) : 'r' + b64u(raw);
}
async function ghDecode(code){
  let u = unb64u(code.slice(1)); if (code[0] === 'z') u = await zip(u, true);
  let p = 0; const vr = () => { let x = 0, sh = 0, b; do { b = u[p++]; x |= (b & 127) << sh; sh += 7; } while (b & 128); return x & 1 ? -((x + 1) >> 1) : x >> 1; };
  const track = u[p++], t = (u[p++] | u[p++] << 8 | u[p++] << 16) / 1000, paint = PAINTS[u[p++]] || PAINTS[0], nl = u[p++];
  const name = new TextDecoder().decode(u.slice(p, p + nl)); p += nl;
  const n = vr(), S = new Float32Array(n), D = new Float32Array(n), H = new Float32Array(n); let s = 0, dd = 0, h = 0;
  for (let i = 0; i < n; i++) { s += vr(); dd += vr(); h += vr(); S[i] = s / 10; D[i] = dd / 50; H[i] = h / 10; }
  if (!TRACKS[track] || !(t > 0) || n < 20) throw new Error('bad');
  return { track, t, paint: paint.id, hex: paint.hex, name: name || '?', S, D, H };
}
const ghKey = id => 'bullrun_gh_' + id;
let ghChallenge = null;

/* ---------- race start / end ---------- */
function rvStart(opt){
  rvClear(); ghRec = null;
  if (mode !== 'track') return;
  if (!isDaily()) ghRec = { S: [], D: [], H: [] };
  const idx = TRACKS.indexOf(TR);
  if (opt.ghost && opt.ghost.track === idx) rvAdd({ kind: 'ghost', name: opt.ghost.name, hex: opt.ghost.hex === paintById(paintSel).hex ? RIVAL_COLS[1] : opt.ghost.hex, g: opt.ghost, t: opt.ghost.t });
  if (ghostOn && !NET.on && !isDaily()) { const c = store.get(ghKey(TR.id)); if (c) ghDecode(c).then(g => { if (g.track === idx && state !== 'menu' && TR === TRACKS[idx]) rvAdd({ kind: 'ghost', own: true, name: RT_().myBest, hex: '#c9c6d6', g, t: g.t }); }).catch(() => {}); }
  if (NET.on) for (const p of NET.players) if (p.id !== NET.me) rvAdd({ kind: 'net', id: p.id, name: p.name, hex: p.hex, buf: [], s: 60, d: slotD(p.slot) });
}
const slotD = i => [-1.7, 1.7, -5.1][i] ?? 0;
function rvEnd(won, t){
  if (mode !== 'track') return;
  if (NET.on) netSend({ t: 'fin', time: won ? +t.toFixed(3) : null, s: +sP.toFixed(1) });
  if (won && ghRec && ghRec.S.length > 20 && !isDaily()) {
    const prev = PROG[TR.id] && PROG[TR.id].b;
    const g = { track: TRACKS.indexOf(TR), t, paint: paintSel, name: myName || 'Rollway', S: ghRec.S, D: ghRec.D, H: ghRec.H };
    rvLast = g;
    if (!prev || t < prev) ghEncode(g).then(c => store.set(ghKey(TR.id), c)).catch(() => {});
  }
}
let rvLast = null;

/* ---------- per frame ---------- */
function rvRender(){
  if (!rivals.length) return;
  const t = state === 'count' ? 0 : raceT;
  for (const r of rivals) {
    let p;
    if (r.kind === 'ghost') { p = ghostAt(r.g, t); if (p.done && r.fin == null) r.fin = r.g.t; }
    else p = r.left ? { s: r.s, d: r.d, h: 0 } : netAt(r, t);
    r.s = p.s; r.d = p.d;
    const show = !(r.left || (r.fin != null && t - r.fin > 1.5)) && Math.abs(p.s - sP) < 700;
    r.mesh.visible = show;
    if (show) { trackAt(p.s + PLEN / 2, tA); placeCar(r.mesh, p.s, p.d, PLEN, 0, 0); if (p.h > 0) r.mesh.position.addScaledVector(carN, p.h); }
    /* name tag above the car, only while it is close and in front of the camera */
    let on = show && p.s > sP - 40 && p.s < sP + 160;
    if (on) { _pv.copy(r.mesh.position); _pv.addScaledVector(carN, 2.2); _pv.project(camera); on = _pv.z < 1 && Math.abs(_pv.x) < 1.05 && Math.abs(_pv.y) < 1.05; }
    if (on) { r.tag.style.transform = 'translate(' + ((_pv.x * .5 + .5) * W).toFixed(1) + 'px,' + ((-_pv.y * .5 + .5) * H).toFixed(1) + 'px) translate(-50%,-100%)'; }
    if (r.tag.hidden === on) r.tag.hidden = !on;
  }
}
/* position among rivals, shown under the timer */
function rvHud(){
  let el = $('hPos'); if (!rivals.length) { if (el && !el.hidden) el.hidden = true; return; }
  if (!el) { el = document.createElement('div'); el.id = 'hPos'; el.className = 'hpos'; $('hTimeBox').appendChild(el); }
  const ahead = rivals.filter(r => r.fin != null && r.fin < raceT || r.s > sP + .5).length, n = rivals.length + 1;
  const txt = (NET.on ? '<i class="live">' + RT_().live + '</i>' : '') + RT_().pos + ' <b>' + (ahead + 1) + '</b>/' + n;
  if (el.dataset.t !== txt) { el.dataset.t = txt; el.innerHTML = txt; }
  el.hidden = false;
}

/* ---------- results on the finish card ---------- */
function rvResults(oc){
  if (mode !== 'track') return;
  const L = RT_(), myT = result && result.won ? result.t : null;
  if (rivals.length) {
    const box = document.createElement('div'); box.className = 'rvres'; box.id = 'rvRes'; oc.querySelector('.or').prepend(box); rvResDraw();
  }
  if (!NET.on && rvLast && !isDaily() && result && result.won) {
    const b = document.createElement('button'); b.className = 'go alt rvch'; b.type = 'button'; b.innerHTML = '<span>' + esc(L.challenge) + '</span>';
    b.onclick = () => rvChallenge(rvLast); oc.querySelector('.or').appendChild(b);
  }
  if (NET.on) {
    const row = oc.querySelector('.or .row'); if (row) row.innerHTML = '<button class="go" id="oRoom" type="button">' + esc(L.again) + '</button><button class="go alt" id="oLeave" type="button">' + esc(L.leave) + '</button>';
    const r1 = $('oRoom'), r2 = $('oLeave'); if (r1) r1.onclick = () => { netSend({ t: 'back' }); toMenu(); roomDlg(); }; if (r2) r2.onclick = () => { netLeave(); toMenu(); };
    oc.querySelectorAll('.or .row').forEach((r, i) => { if (i > 0) r.remove(); });
  }
}
function rvResDraw(){
  const box = $('rvRes'); if (!box) return; const L = RT_();
  const rows = [{ name: L.you, me: true, t: result && result.won ? result.t : null, s: sP, hex: paintById(paintSel).hex }]
    .concat(rivals.map(r => ({ name: r.name, t: r.fin, s: r.s, hex: r.hex, left: r.left, wait: r.kind === 'net' && r.fin == null && !r.left && !r.dnf })));
  rows.sort((a, b) => (a.t == null) - (b.t == null) || (a.t != null ? a.t - b.t : b.s - a.s));
  box.innerHTML = '<div class="lab">' + esc(L.results) + '</div><ol>' + rows.map(r => '<li' + (r.me ? ' class="me"' : '') + '><i style="background:' + r.hex + '"></i><span>' + esc(r.name) + '</span><b>' +
    (r.t != null ? fmtTime(r.t) : r.left ? esc(L.roomLeft) : r.wait ? '…' : esc(L.dnf)) + '</b></li>').join('') + '</ol>';
}
async function rvChallenge(g){
  if (!myName) { const nm = await askName(); if (nm == null) return; g.name = nm; }
  else g.name = myName;
  let code; try { code = await ghEncode(g); } catch (e) { return; }
  const url = 'https://' + OWN_HOST + '/#g=' + code, text = fill(RT_().challengeText, { t: fmtTime(g.t), tr: trName(TRACKS[g.track]) });
  try { if (navigator.share) { await navigator.share({ title: 'Rollway', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text + '\n' + url); toast(RT_().copied || 'OK'); } catch (e) { prompt('', url); }
}
function askName(){
  return new Promise(res => {
    const L = RT_();
    dlg('<h2>' + esc(L.yourName) + '</h2><input id="rvName" class="rvin" maxlength="14" autocomplete="nickname" value="' + esc(myName) + '"><div class="row"><button class="go" id="rvOk" type="button">OK</button><button class="go alt" id="rvNo" type="button">' + esc(L.later) + '</button></div>');
    const inp = $('rvName'); setTimeout(() => inp.focus(), 50);
    const ok = () => { const v2 = inp.value.trim().slice(0, 14); if (!v2) { inp.focus(); return; } myName = v2; store.set('bullrun_name', v2); closeDlg(); res(v2); };
    $('rvOk').onclick = ok; inp.onkeydown = e => { if (e.key === 'Enter') ok(); }; $('rvNo').onclick = () => { closeDlg(); res(null); };
  });
}

/* ---------- opening a challenge link ---------- */
async function rvOpenChallenge(code){
  let g; try { g = await ghDecode(code); } catch (e) { toast(RT_().expired); return; }
  const L = RT_(), tr = TRACKS[g.track];
  dlg('<h2>' + esc(L.challengeTitle) + '</h2><p>' + esc(fill(L.challengeMsg, { n: g.name, tr: trName(tr), t: fmtTime(g.t) })) + '</p><div class="row"><button class="go" id="rvGo" type="button">' + esc(L.raceIt) + '</button><button class="go alt" id="rvNo" type="button">' + esc(L.later) + '</button></div>');
  $('rvGo').onclick = () => { closeDlg(); startRace({ track: g.track, ghost: g }); };
  $('rvNo').onclick = closeDlg;
}

/* ================= live races: rooms on rooms.stratoshivibes.com (Cloudflare Durable Object) ================= */
const ROOMS = 'wss://rooms.stratoshivibes.com';
const NET = { on: false, ws: null, code: '', me: null, host: null, players: [], track: 0, phase: 'idle', acc: 0, off: 0, retry: 0 };
function netSend(o){ try { if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(o)); } catch (e) {} }
function netLeave(){ try { NET.ws && NET.ws.close(1000); } catch (e) {} NET.ws = null; NET.on = false; NET.phase = 'idle'; NET.code = ''; NET.players = []; }
function netOpen(code, create){
  return new Promise((res, rej) => {
    if (!ONLINE) return rej(new Error('off'));
    let ws; try { ws = new WebSocket(ROOMS + '/room/' + encodeURIComponent(code) + (create ? '?create=1' : '')); } catch (e) { return rej(e); }
    const to = setTimeout(() => { try { ws.close(); } catch (e) {} rej(new Error('timeout')); }, 7000);
    ws.onopen = () => { clearTimeout(to); NET.ws = ws; NET.code = code; ws.send(JSON.stringify({ t: 'hello', name: myName || 'Player', hex: paintById(paintSel).hex })); res(ws); };
    ws.onerror = () => { clearTimeout(to); rej(new Error('ws')); };
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (x) { return; } netMsg(m); };
    ws.onclose = () => { if (NET.ws === ws) { NET.ws = null; if (NET.phase !== 'idle') { toast(RT_().roomOff); if (state !== 'race') { NET.on = false; NET.phase = 'idle'; if (!$('dlg').hidden && $('rvRoom')) closeDlg(); } } } };
  });
}
function netMsg(m){
  if (m.t === 'err') { toast(m.e === 'full' ? RT_().roomFull : m.e === 'gone' ? RT_().roomGone : RT_().roomOff); netLeave(); if ($('rvRoom')) closeDlg(); return; }
  if (m.now) NET.off = m.now - Date.now();
  if (m.t === 'room') { NET.me = m.you || NET.me; NET.host = m.host; NET.players = m.players; NET.track = m.track; NET.phase = m.phase; if ($('rvRoom')) roomDraw(); rvSyncLeft(); return; }
  if (m.t === 'start') {
    NET.players = m.players; NET.track = m.track; NET.on = true; NET.phase = 'race'; closeDlg();
    const me = NET.players.find(p => p.id === NET.me);
    startRace({ track: m.track, net: true }); d = dCam = slotD(me ? me.slot : 0);
    countT = Math.max(.5, (m.at - (Date.now() + NET.off)) / 1000); return;
  }
  if (m.t === 'st') { const r = rivals.find(x => x.id === m.id); if (r) { r.buf.push(m); if (r.buf.length > 40) r.buf.splice(0, r.buf.length - 40); } return; }
  if (m.t === 'fin') { const r = rivals.find(x => x.id === m.id); if (r) { if (m.time != null) r.fin = m.time; else r.dnf = true; if (m.s) r.s = m.s; } rvResDraw(); return; }
}
function rvSyncLeft(){ if (!NET.on) return; for (const r of rivals) if (r.kind === 'net' && !NET.players.some(p => p.id === r.id)) { r.left = true; rvResDraw(); } }
const roomCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; const u = crypto.getRandomValues(new Uint8Array(5)); for (const x of u) s += A[x % A.length]; return s; };

function friendsDlg(){
  const L = RT_();
  dlg('<h2>' + esc(L.friends) + '</h2>' +
    '<button class="go rvbig" id="rvLive" type="button"><span>' + esc(L.liveTitle) + '</span><small>' + esc(L.liveSub) + '</small></button>' +
    '<div class="rvjoin"><input id="rvCode" class="rvin" maxlength="5" autocapitalize="characters" autocomplete="off" placeholder="' + esc(L.roomCode) + '"><button class="go alt" id="rvJoin" type="button">' + esc(L.roomJoin) + '</button></div>' +
    '<button class="go alt rvbig" id="rvGhost" type="button"><span>' + esc(L.chTitle) + '</span><small>' + esc(L.chSub) + '</small></button>');
  $('rvLive').onclick = () => roomEnter(roomCode(), true);
  $('rvJoin').onclick = () => { const c = $('rvCode').value.trim().toUpperCase(); if (c.length === 5) roomEnter(c, false); else $('rvCode').focus(); };
  $('rvCode').onkeydown = e => { if (e.key === 'Enter') $('rvJoin').click(); };
  $('rvGhost').onclick = () => { closeDlg(); go('tracks'); };
}
async function roomEnter(code, create){
  if (!myName) { const nm = await askName(); if (nm == null) return; }
  try { await netOpen(code, create); NET.phase = 'lobby'; roomDlg(); }
  catch (e) { toast(RT_().roomOff); }
}
function roomDlg(){ dlg('<div id="rvRoom"></div>'); roomDraw(); }
function roomDraw(){
  const box = $('rvRoom'); if (!box) return; const L = RT_(), host = NET.me && NET.me === NET.host;
  box.innerHTML = '<h2>' + esc(L.liveTitle) + '</h2>' +
    '<div class="rvcode"><span class="lab">' + esc(L.roomCode) + '</span><b>' + esc(NET.code) + '</b><button class="go alt" id="rvInv" type="button">' + esc(L.roomShare) + '</button></div>' +
    '<ol class="rvpl">' + NET.players.map(p => '<li><i style="background:' + esc(p.hex) + '"></i><span>' + esc(p.name) + (p.id === NET.me ? ' (' + esc(L.you) + ')' : '') + '</span>' + (p.id === NET.host ? '<small>' + esc(L.roomHost) + '</small>' : '') + '</li>').join('') + '</ol>' +
    (NET.players.length < 2 ? '<p>' + esc(L.roomWait) + '</p>' : '') +
    (host ? '<label class="rvtr"><span class="lab">' + esc(L.pickTrack) + '</span><select id="rvTrack">' + TRACKS.map((t, i) => '<option value="' + i + '"' + (i === NET.track ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(trName(t)) + '</option>').join('') + '</select></label>'
      : '<p>' + esc(trName(TRACKS[NET.track] || TRACKS[0])) + ' · ' + esc(L.waitHost) + '</p>') +
    '<div class="row">' + (host ? '<button class="go" id="rvStart" type="button"' + (NET.players.length < 2 ? ' disabled' : '') + '>' + esc(L.roomStart) + '</button>' : '') + '<button class="go alt" id="rvLeave" type="button">' + esc(L.leave) + '</button></div>';
  $('rvInv').onclick = async () => { const url = 'https://' + OWN_HOST + '/#r=' + NET.code, text = fill(L.invite, { c: NET.code });
    try { if (navigator.share) { await navigator.share({ title: 'Rollway', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text + '\n' + url); toast(L.copied || 'OK'); } catch (e) {} };
  if ($('rvTrack')) $('rvTrack').onchange = e => netSend({ t: 'track', track: +e.target.value });
  if ($('rvStart')) $('rvStart').onclick = () => { if (NET.players.length < 2) { toast(L.need2); return; } audioStart(); netSend({ t: 'go' }); };
  $('rvLeave').onclick = () => { netLeave(); closeDlg(); };
}
T.el.copied = T.el.copied || 'Αντιγράφηκε'; T.en.copied = T.en.copied || 'Copied';

/* ================= rear-view mirror: a small second view, rendered at low resolution every other frame ================= */
let mirror = null, mirrorFrame = 0;
function mirrorSetup(){
  const rt = new THREE.WebGLRenderTarget(320, 112, { depthBuffer: true });
  const cam = new THREE.PerspectiveCamera(46, 320 / 112, .5, 900);
  const qs = new THREE.Scene(), qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  rt.texture.wrapS = THREE.RepeatWrapping; rt.texture.repeat.x = -1;   // flipped left to right, like a real mirror
  qs.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: rt.texture, depthTest: false, depthWrite: false })));
  mirror = { rt, cam, qs, qc };
  const fr = document.createElement('div'); fr.id = 'mirrorFrame'; fr.className = 'mirrorframe'; fr.hidden = true; document.body.appendChild(fr); mirror.fr = fr;
}
function mirrorRender(){
  const want = mirrorOn() && (state === 'race' || state === 'count' || state === 'ending') && !NO_MIRROR;
  if (!want) { if (mirror && !mirror.fr.hidden) mirror.fr.hidden = true; return; }
  if (!mirror) mirrorSetup();
  /* size: about a third of the screen width, top centre, under the timer */
  const mw = Math.round(clamp(W * .34, 150, 300)), mh = Math.round(mw * .33), mx = Math.round((W - mw) / 2), my = Math.round(clamp(H * .11, 58, 92));
  const fr = mirror.fr; if (fr.hidden) fr.hidden = false;
  const key = mw + 'x' + mh + '@' + mx + ',' + my; if (fr.dataset.k !== key) { fr.dataset.k = key; Object.assign(fr.style, { left: mx + 'px', top: my + 'px', width: mw + 'px', height: mh + 'px' }); mirror.cam.aspect = mw / mh; mirror.cam.updateProjectionMatrix(); }
  if ((mirrorFrame++ & 1) === 0) {
    const n1 = new THREE.Vector3(), n2 = new THREE.Vector3();
    roadAt(sP + PLEN * .45, d, mirror.cam.position, n1); mirror.cam.position.addScaledVector(n1, 1.25 + flyH);
    roadAt(sP - 40, d * .7, tmpV, n2); tmpV.addScaledVector(n2, .6 + flyH * .5);
    mirror.cam.up.copy(n1); mirror.cam.lookAt(tmpV);
    const pv = player.visible; player.visible = false; const fog = scene.fog;
    renderer.setRenderTarget(mirror.rt); renderer.render(scene, mirror.cam); renderer.setRenderTarget(null);
    player.visible = pv; scene.fog = fog;
  }
  const ac = renderer.autoClear; renderer.autoClear = false;
  const pr = renderer.getPixelRatio(), cw = renderer.domElement.width / pr, ch = renderer.domElement.height / pr;
  renderer.setViewport(mx, ch - my - mh, mw, mh); renderer.setScissor(mx, ch - my - mh, mw, mh); renderer.setScissorTest(true);
  renderer.render(mirror.qs, mirror.qc);
  renderer.setScissorTest(false); renderer.setViewport(0, 0, cw, ch); renderer.autoClear = ac;
}
const NO_MIRROR = /[?&]nomirror\b/.test(location.search);

/* ---------- menu, settings and links ---------- */
(() => {
  const mb = document.querySelector('#start .mainbtns');
  if (mb) { const b = document.createElement('button'); b.className = 'go friends'; b.id = 'goFriends'; b.type = 'button'; b.innerHTML = '<span class="dn"><span data-t="friends"></span><small data-t="friendsSub"></small></span>'; mb.appendChild(b); b.addEventListener('click', () => friendsDlg()); }
  const gs = $('segGfx') && $('segGfx').closest('.opt');
  if (gs) {
    gs.insertAdjacentHTML('afterend', '<div class="opt"><span class="lab" data-t="ghostOpt"></span><div class="seg" id="segGhost"><button type="button" data-v="on" data-t="on"></button><button type="button" data-v="off" data-t="off"></button></div></div>' +
      '<div class="opt"><span class="lab" data-t="mirrorOpt"></span><div class="seg" id="segMirror"><button type="button" data-v="on" data-t="on"></button><button type="button" data-v="off" data-t="off"></button></div></div>');
    $('segGhost').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ghostOn = b.dataset.v === 'on'; store.set('bullrun_ghost', ghostOn ? '1' : '0'); applyLang(); });
    $('segMirror').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; mirrorPref = b.dataset.v; store.set('bullrun_mirror', mirrorPref); applyLang(); });
  }
  const h = location.hash;
  const mg = h.match(/[#&]g=([A-Za-z0-9_-]+)/), mr = h.match(/[#&]r=([A-Z0-9]{5})/);
  if (mg || mr) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  if (mg) setTimeout(() => rvOpenChallenge(mg[1]), 900);
  else if (mr) setTimeout(() => roomEnter(mr[1], false), 900);
})();
