// Registre d'appel UNA - serveur (Node.js 18+, aucune dépendance)
const http = require('http'), fs = require('fs'), path = require('path'), c = require('crypto');
const PORT = process.env.PORT || 3000, DB = process.env.DATA_FILE || path.join(__dirname, 'data.json'); // DATA_FILE : emplacement du fichier de données (disque persistant en hébergement)
const sha = s => c.createHash('sha256').update(s).digest('hex');
const SLOT = 15000, DUR = 180000, FIL = ['MI', 'PC', 'SN'], NIV = ['L1', 'L2', 'L3', 'M1', 'M2'];
let db = { students: {}, sessions: {}, trash: {} };
try { db = JSON.parse(fs.readFileSync(DB)); } catch {}
db.trash = db.trash || {};
for (const k of ['students', 'sessions', 'ues']) db.trash[k] = db.trash[k] || {};
// Code Administrateur (haché). Valeur initiale : variable ADMIN_CODE ou code par défaut ; CHANGEZ-LE à la première connexion.
db.cfg = db.cfg || { admin: sha(process.env.ADMIN_CODE || 'Admin-MI-L12026') };
// Une UE = une interface Docteur avec son propre code. L'UE « Général » reprend le code Docteur d'origine.
if (!db.ues) db.ues = { general: { nom: 'Général', code: db.cfg.doctor || sha('Univ-UNA.CI225'), actif: true } };
delete db.cfg.doctor;
for (const s of Object.values(db.sessions)) if (!s.ue) s.ue = 'general';
for (const u of Object.values(db.ues)) if (u.listes === undefined) u.listes = true; // accès du Docteur aux listes par niveau
const save = () => fs.writeFileSync(DB, JSON.stringify(db));
save();
const SECRET = c.randomBytes(16).toString('hex'), tokens = {}, fails = {};
const sig = (id, s) => c.createHmac('sha256', SECRET).update(id + '.' + s).digest('hex').slice(0, 12);
const hashPw = (pw, salt) => c.scryptSync(pw, salt, 32).toString('hex');
const send = (r, code, o) => { r.writeHead(code, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(o)); };
const who = (q, role) => { const t = tokens[(q.headers.authorization || '').slice(7)]; return t && t.role === role ? t : null; };
// Code à 6 chiffres affiché sous le QR code (saisie manuelle) : change en même temps que le QR code.
const short = (id, n) => String(parseInt(c.createHmac('sha256', SECRET).update('c.' + id + '.' + n).digest('hex').slice(0, 8), 16) % 1000000).padStart(6, '0');
const codeFails = {};
const slotOf = s => Math.floor((Date.now() - s.start) / SLOT);
const st = ip => db.students[ip] || db.trash.students[ip] || { nom: '?', prenoms: '(profil inconnu)' };
const ueName = id => (db.ues[id] || db.trash.ues[id] || { nom: '?' }).nom;
const ueOn = id => !!(db.ues[id] && db.ues[id].actif);
const people = s => s.present.map(p => ({ ip: p.ip, nom: st(p.ip).nom, prenoms: st(p.ip).prenoms })).sort((a, b) => a.nom.localeCompare(b.nom));
const info = (id, s) => ({ id, date: s.date, debut: s.debut, fin: s.fin, filiere: s.filiere, niveau: s.niveau, start: s.start, ue: ueName(s.ue), n: s.present.length, present: people(s) });
const sessList = (o, ue) => Object.entries(o).filter(([, s]) => !ue || s.ue === ue).sort((a, b) => b[1].start - a[1].start).map(([id, s]) => info(id, s));
const stuList = o => Object.entries(o).map(([ip, s]) => ({ ip, nom: s.nom, prenoms: s.prenoms })).sort((a, b) => a.nom.localeCompare(b.nom));
const ueList = o => Object.entries(o).map(([id, u]) => ({ id, nom: u.nom, actif: u.actif, listes: u.listes !== false })).sort((a, b) => a.nom.localeCompare(b.nom));
const PERM = () => ({ listes: true, appels: true, historique: true });
const ORD = { attente: 0, valide: 1, refuse: 2 };
const delegList = () => Object.entries(db.students).filter(([, s]) => s.deleg).map(([ip, s]) => ({ ip, nom: s.nom, prenoms: s.prenoms, ...s.deleg, n: Object.values(db.sessions).filter(x => x.present.some(p => p.ip === ip)).length }))
  .sort((a, b) => ORD[a.statut] - ORD[b.statut] || a.nom.localeCompare(b.nom));
// Délégués / sous-délégués : un compte étudiant avec une demande (deleg). Tant que l'administrateur n'a pas validé, c'est un simple étudiant.
function dgAuth(q, r, perm) {
  const t = who(q, 'etu'), s = t && db.students[t.ip];
  if (!s || !s.deleg || s.deleg.statut !== 'valide') { send(r, 403, { error: 'Accès refusé.' }); return null; }
  if (perm && !(s.deleg.perm || {})[perm]) { send(r, 403, { error: "Cette fonction est désactivée par l'administrateur." }); return null; }
  return { ip: t.ip, d: s.deleg };
}
const grpSessions = d => Object.entries(db.sessions).filter(([, s]) => s.niveau === d.niveau && s.filiere === d.filiere);
const used = h => h === db.cfg.admin || Object.values(db.ues).some(u => u.code === h);
// Un seul écran de connexion « Docteur » : le code d'une UE ouvre son interface Docteur, le code Administrateur ouvre l'administration.
function checkCode(q, r, code) {
  const k = (q.headers['x-forwarded-for'] || '').split(',')[0].trim() || q.socket.remoteAddress, f = fails[k] || { n: 0, until: 0 };
  if (Date.now() < f.until) { send(r, 429, { error: "Trop d'essais, réessayez dans quelques minutes." }); return null; }
  const h = sha(code), ue = Object.keys(db.ues).find(i => db.ues[i].code === h), role = h === db.cfg.admin ? 'adm' : ue ? 'doc' : null;
  if (!role) { f.n++; if (f.n >= 5) { f.until = Date.now() + 300000; f.n = 0; } fails[k] = f; send(r, 401, { error: 'Code incorrect.' }); return null; }
  fails[k] = { n: 0, until: 0 }; return { role, ue };
}
const newToken = (role, extra = {}) => { const t = c.randomBytes(16).toString('hex'); tokens[t] = { role, ...extra }; return t; };

function admin(q, r, name, b, str) {
  if (!who(q, 'adm')) return send(r, 401, { error: 'Accès refusé.' });
  const a = name.slice(4), ip = str(b.ip).toUpperCase(), id = str(b.id), T = db.trash;
  const ok = () => { save(); send(r, 200, { ok: true }); };
  const bad = m => send(r, 400, { error: m });
  if (a === 'data') return send(r, 200, { students: stuList(db.students), sessions: sessList(db.sessions), ues: ueList(db.ues), deleg: delegList(), trash: { students: stuList(T.students), sessions: sessList(T.sessions), ues: ueList(T.ues) } });
  if (a === 'student/update') {
    const s = db.students[ip]; if (!s) return send(r, 404, { error: 'Profil introuvable.' });
    if (str(b.nom)) s.nom = str(b.nom); if (str(b.prenoms)) s.prenoms = str(b.prenoms);
    if (str(b.code)) { s.salt = c.randomBytes(8).toString('hex'); s.pw = hashPw(str(b.code), s.salt); }
    return ok();
  }
  if (a === 'student/delete') {
    if (!db.students[ip]) return send(r, 404, { error: 'Profil introuvable.' });
    T.students[ip] = db.students[ip]; delete db.students[ip];
    for (const k in tokens) if (tokens[k].ip === ip) delete tokens[k];
    return ok();
  }
  if (a === 'student/restore') {
    if (!T.students[ip]) return send(r, 404, { error: 'Introuvable dans la corbeille.' });
    if (db.students[ip]) return send(r, 409, { error: 'Cet I.P existe déjà.' });
    db.students[ip] = T.students[ip]; delete T.students[ip]; return ok();
  }
  if (a === 'student/purge') { delete T.students[ip]; return ok(); }
  if (a === 'session/delete') { if (!db.sessions[id]) return send(r, 404, { error: 'Appel introuvable.' }); T.sessions[id] = db.sessions[id]; delete db.sessions[id]; return ok(); }
  if (a === 'session/restore') { if (!T.sessions[id]) return send(r, 404, { error: 'Introuvable.' }); db.sessions[id] = T.sessions[id]; delete T.sessions[id]; return ok(); }
  if (a === 'session/purge') { delete T.sessions[id]; return ok(); }
  if (a === 'presence/remove') { const s = db.sessions[id]; if (!s) return send(r, 404, { error: 'Appel introuvable.' }); s.present = s.present.filter(p => p.ip !== ip); return ok(); }
  if (a === 'presence/add') {
    const s = db.sessions[id]; if (!s) return send(r, 404, { error: 'Appel introuvable.' });
    if (!db.students[ip]) return send(r, 404, { error: 'I.P inconnu.' });
    if (s.present.some(p => p.ip === ip)) return send(r, 409, { error: 'Déjà présent.' });
    s.present.push({ ip, time: Date.now() }); return ok();
  }
  const dgd = () => db.students[ip] && db.students[ip].deleg;
  if (a === 'dg/validate') {
    const d = dgd(); if (!d) return send(r, 404, { error: 'Profil introuvable.' });
    if (!['delegue', 'sous'].includes(str(b.role))) return bad('Fonction invalide.');
    d.statut = 'valide'; d.valide = str(b.role); d.dateValid = Date.now(); d.perm = d.perm || PERM(); return ok();
  }
  if (a === 'dg/refuse') { const d = dgd(); if (!d) return send(r, 404, { error: 'Profil introuvable.' }); d.statut = 'refuse'; d.valide = null; return ok(); }
  if (a === 'dg/perm') {
    const d = dgd(); if (!d) return send(r, 404, { error: 'Profil introuvable.' });
    d.perm = d.perm || PERM(); const k = str(b.key), v = !!b.value;
    if (k === 'all') d.perm = { listes: v, appels: v, historique: v }; else if (k in d.perm) d.perm[k] = v; else return bad('Accès inconnu.');
    return ok();
  }
  if (a === 'dg/update') {
    const d = dgd(); if (!d) return send(r, 404, { error: 'Profil introuvable.' });
    if (!NIV.includes(str(b.niveau)) || !FIL.includes(str(b.filiere))) return bad('Filière ou niveau invalide.');
    d.niveau = str(b.niveau); d.filiere = str(b.filiere); return ok();
  }
  if (a === 'dg/clearcode') { // supprime le code : plus de connexion possible tant qu'un nouveau code n'est pas défini
    const s = db.students[ip]; if (!s) return send(r, 404, { error: 'Profil introuvable.' });
    s.pw = null; for (const k in tokens) if (tokens[k].ip === ip) delete tokens[k]; return ok();
  }
  if (a === 'dg/purge') { // effacement définitif du profil (les présences passées restent, sous « profil inconnu »)
    if (!db.students[ip] && !T.students[ip]) return send(r, 404, { error: 'Profil introuvable.' });
    delete db.students[ip]; delete T.students[ip]; for (const k in tokens) if (tokens[k].ip === ip) delete tokens[k]; return ok();
  }
  if (a === 'ue/add') {
    const nom = str(b.nom), code = str(b.code);
    if (!nom || code.length < 6) return bad('Nom obligatoire et code de 6 caractères minimum.');
    if (used(sha(code))) return bad('Ce code est déjà utilisé.');
    db.ues[c.randomBytes(4).toString('hex')] = { nom, code: sha(code), actif: true, listes: true }; return ok();
  }
  if (a === 'ue/update') {
    const u = db.ues[id]; if (!u) return send(r, 404, { error: 'UE introuvable.' });
    if (str(b.nom)) u.nom = str(b.nom);
    if (b.code !== undefined) {
      if (str(b.code).length < 6) return bad('Le code doit contenir au moins 6 caractères.');
      if (used(sha(str(b.code)))) return bad('Ce code est déjà utilisé.');
      u.code = sha(str(b.code));
    }
    if (b.actif !== undefined) u.actif = !!b.actif;
    if (b.listes !== undefined) u.listes = !!b.listes;
    return ok();
  }
  if (a === 'ue/delete') {
    if (!db.ues[id]) return send(r, 404, { error: 'UE introuvable.' });
    T.ues[id] = db.ues[id]; delete db.ues[id];
    for (const k in tokens) if (tokens[k].ue === id) delete tokens[k];
    return ok();
  }
  if (a === 'ue/restore') {
    if (!T.ues[id]) return send(r, 404, { error: 'Introuvable.' });
    if (used(T.ues[id].code)) return send(r, 409, { error: 'Le code de cette UE est utilisé par une autre.' });
    db.ues[id] = T.ues[id]; delete T.ues[id]; return ok();
  }
  if (a === 'ue/purge') { delete T.ues[id]; return ok(); }
  if (a === 'config') {
    if (b.admin !== undefined) {
      if (str(b.admin).length < 6) return bad('Le code doit contenir au moins 6 caractères.');
      if (used(sha(str(b.admin)))) return bad('Ce code est déjà utilisé.');
      db.cfg.admin = sha(str(b.admin));
    }
    return ok();
  }
  send(r, 404, { error: 'Introuvable.' });
}

async function api(q, r, name, u) {
  let b = {};
  if (q.method === 'POST') { let d = ''; for await (const x of q) d += x; try { b = JSON.parse(d); } catch {} }
  const str = v => String(v || '').trim();
  if (name.startsWith('adm/')) return admin(q, r, name, b, str);
  if (name === 'register' || name === 'dg/register') {
    const ip = str(b.ip).toUpperCase(), nom = str(b.nom), prenoms = str(b.prenoms), code = str(b.code);
    if (!ip || !nom || !prenoms || !code) return send(r, 400, { error: 'Tous les champs sont obligatoires.' });
    if (name === 'dg/register' && (!['delegue', 'sous'].includes(str(b.role)) || !NIV.includes(str(b.niveau)) || !FIL.includes(str(b.filiere)))) return send(r, 400, { error: 'Fonction, filière ou niveau invalide.' });
    if (db.students[ip]) return send(r, 409, { error: 'Cet I.P est déjà inscrit, veuillez vous connecter.' });
    if (db.trash.students[ip]) return send(r, 409, { error: "Cet I.P correspond à un compte supprimé : contactez l'administrateur." });
    const salt = c.randomBytes(8).toString('hex'), rec = { nom, prenoms, salt, pw: hashPw(code, salt) };
    if (name === 'dg/register') rec.deleg = { role: str(b.role), niveau: str(b.niveau), filiere: str(b.filiere), statut: 'attente', valide: null, date: Date.now(), perm: PERM() };
    db.students[ip] = rec; save();
    return send(r, 200, { ok: true });
  }
  if (name === 'login') {
    const ip = str(b.ip).toUpperCase(), s = db.students[ip];
    if (!s || !s.pw || hashPw(str(b.code), s.salt) !== s.pw) return send(r, 401, { error: 'I.P ou code incorrect.' });
    return send(r, 200, { token: newToken('etu', { ip }), deleg: s.deleg ? { statut: s.deleg.statut, role: s.deleg.valide || s.deleg.role } : null });
  }
  if (name === 'doctor') {
    const x = checkCode(q, r, str(b.code)); if (!x) return;
    return send(r, 200, { token: newToken(x.role, { ue: x.ue }), role: x.role, ue: x.ue ? db.ues[x.ue].nom : null, listes: x.ue ? db.ues[x.ue].listes !== false : false });
  }
  if (name === 'start') {
    const d = who(q, 'doc'); if (!d || !db.ues[d.ue]) return send(r, 401, { error: 'Accès refusé.' });
    if (!db.ues[d.ue].actif) return send(r, 403, { error: "L'appel est désactivé par l'administrateur." });
    const date = str(b.date), m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date), dt = m && new Date(+m[3], +m[2] - 1, +m[1]);
    const debut = str(b.debut), fin = str(b.fin), filiere = str(b.filiere), niveau = str(b.niveau), tm = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!dt || dt.getDate() !== +m[1] || dt.getMonth() !== +m[2] - 1) return send(r, 400, { error: 'Date invalide.' });
    if (!tm.test(debut) || !tm.test(fin) || fin <= debut) return send(r, 400, { error: "Intervalle de temps invalide (la fin doit être après le début)." });
    if (!FIL.includes(filiere) || !NIV.includes(niveau)) return send(r, 400, { error: 'Filière ou niveau invalide.' });
    if (!b.force && Object.values(db.sessions).some(s => s.ue === d.ue && s.date === date && s.debut === debut && s.fin === fin && s.filiere === filiere && s.niveau === niveau))
      return send(r, 409, { exists: true, error: 'Un appel identique existe déjà.' });
    const id = c.randomBytes(4).toString('hex');
    db.sessions[id] = { ue: d.ue, date, debut, fin, filiere, niveau, start: Date.now(), present: [] }; save();
    return send(r, 200, { id });
  }
  if (name === 'qr') {
    const d = who(q, 'doc'); if (!d) return send(r, 401, { error: 'Accès refusé.' });
    const id = u.searchParams.get('id'), s = db.sessions[id];
    if (!s || s.ue !== d.ue) return send(r, 404, { error: 'Session inconnue.' });
    const left = ueOn(s.ue) ? s.start + DUR - Date.now() : 0, n = slotOf(s);
    return send(r, 200, { left: Math.max(0, left), qr: left > 0 ? id + '.' + n + '.' + sig(id, n) : null, code: left > 0 ? short(id, n) : null });
  }
  if (name === 'scan') {
    const t = who(q, 'etu'); if (!t) return send(r, 401, { error: 'Veuillez vous connecter.' });
    if (!db.students[t.ip]) return send(r, 401, { error: 'Compte introuvable.' });
    const raw = str(b.qr).replace(/\s/g, '');
    let id, s;
    if (/^\d{6}$/.test(raw)) { // code saisi à la main (6 chiffres affichés sous le QR code)
      const f = codeFails[t.ip] || { n: 0, until: 0 };
      if (Date.now() < f.until) return send(r, 429, { error: "Trop d'essais, réessayez dans quelques minutes." });
      for (const [i, x] of Object.entries(db.sessions)) {
        if (Date.now() > x.start + DUR || !ueOn(x.ue)) continue;
        const cur = slotOf(x), late = Date.now() - (x.start + cur * SLOT) < 3000;
        for (const k of late ? [cur, cur - 1] : [cur]) if (short(i, k) === raw) { id = i; s = x; }
      }
      if (!s) { f.n++; if (f.n >= 5) { f.until = Date.now() + 60000; f.n = 0; } codeFails[t.ip] = f; return send(r, 400, { error: 'Code incorrect ou expiré, vérifiez le code affiché.' }); }
      codeFails[t.ip] = { n: 0, until: 0 };
    } else {
      const [i2, n2, g] = raw.split('.'); id = i2; s = db.sessions[id];
      if (!s || Date.now() > s.start + DUR || !ueOn(s.ue)) return send(r, 400, { error: "Aucune session d'appel en cours." });
      const cur = slotOf(s), late = Date.now() - (s.start + cur * SLOT) < 3000;
      if (!(+n2 === cur || (+n2 === cur - 1 && late)) || g !== sig(id, n2)) return send(r, 400, { error: 'QR code expiré, veuillez rescanner.' });
    }
    if (s.present.some(p => p.ip === t.ip)) return send(r, 409, { error: 'Votre présence est déjà enregistrée.' });
    s.present.push({ ip: t.ip, time: Date.now() }); save();
    return send(r, 200, { ok: true });
  }
  if (name === 'dg/me') { const x = dgAuth(q, r); if (!x) return; return send(r, 200, { role: x.d.valide, niveau: x.d.niveau, filiere: x.d.filiere, perm: x.d.perm || PERM() }); }
  if (name === 'dg/listes') {
    const x = dgAuth(q, r, 'listes'); if (!x) return;
    const S = grpSessions(x.d), m = {};
    S.forEach(([, s]) => s.present.forEach(p => { (m[p.ip] = m[p.ip] || { ip: p.ip, nom: st(p.ip).nom, prenoms: st(p.ip).prenoms, n: 0 }).n++; }));
    return send(r, 200, { niveau: x.d.niveau, filiere: x.d.filiere, m: S.length, list: Object.values(m).sort((a, b) => a.nom.localeCompare(b.nom)) });
  }
  if (name === 'dg/appels') { const x = dgAuth(q, r, 'appels'); if (!x) return; return send(r, 200, grpSessions(x.d).sort((a, b) => b[1].start - a[1].start).map(([id, s]) => info(id, s))); }
  if (name === 'dg/hist') {
    const x = dgAuth(q, r, 'historique'); if (!x) return; const ip = str(u.searchParams.get('ip')).toUpperCase();
    return send(r, 200, { nom: st(ip).nom, prenoms: st(ip).prenoms, ip, list: grpSessions(x.d).filter(([, s]) => s.present.some(p => p.ip === ip)).sort((a, b) => b[1].start - a[1].start).map(([id, s]) => { const { present, ...o } = info(id, s); return o; }) });
  }
  if (name === 'lists') { // listes par niveau : uniquement les appels de l'UE du Docteur, sauf blocage par l'administrateur
    const d = who(q, 'doc'); if (!d || !db.ues[d.ue]) return send(r, 401, { error: 'Accès refusé.' });
    if (db.ues[d.ue].listes === false) return send(r, 403, { error: "Cette fonction est désactivée par l'administrateur." });
    return send(r, 200, sessList(db.sessions, d.ue));
  }
  if (name === 'export') { const d = who(q, 'doc'); if (!d) return send(r, 401, { error: 'Accès refusé.' }); return send(r, 200, sessList(db.sessions, d.ue)); } // tous les appels de l'UE (avec présents), pour le téléchargement
  if (name === 'dates') { const d = who(q, 'doc'); if (!d) return send(r, 401, { error: 'Accès refusé.' }); return send(r, 200, sessList(db.sessions, d.ue).map(({ present, ...x }) => x)); }
  if (name === 'presence') {
    const d = who(q, 'doc'); if (!d) return send(r, 401, { error: 'Accès refusé.' });
    const s = db.sessions[u.searchParams.get('id')]; if (!s || s.ue !== d.ue) return send(r, 404, { error: 'Session inconnue.' });
    return send(r, 200, { ...info('', s), list: people(s) });
  }
  send(r, 404, { error: 'Introuvable.' });
}

http.createServer((q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname.startsWith('/api/')) return api(q, r, u.pathname.slice(5), u).catch(() => send(r, 500, { error: 'Erreur serveur.' }));
  const pub = f => path.join(__dirname, 'public', f);
  const STATIC = { '/i18n.js': 'application/javascript; charset=utf-8', '/fond.jpg': 'image/jpeg' };
  if (STATIC[u.pathname] && fs.existsSync(pub(u.pathname.slice(1)))) { r.writeHead(200, { 'Content-Type': STATIC[u.pathname], 'Cache-Control': 'public, max-age=86400' }); return r.end(fs.readFileSync(pub(u.pathname.slice(1)))); }
  let html = fs.readFileSync(pub('index.html'), 'utf8');
  r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  r.end(html);
}).listen(PORT, () => console.log("Registre d'appel UNA : http://localhost:" + PORT));
