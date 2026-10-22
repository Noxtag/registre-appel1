/* Bascule Français / English. Français par défaut. Ce fichier traduit l'interface à la volée : aucun autre fichier à modifier. */
(function () {
  var KEY = 'lang', lang = 'fr';
  try { if (localStorage.getItem(KEY) === 'en') lang = 'en'; } catch (e) {}

  var D = {
    "REGISTRE D'APPEL UNA": "ATTENDANCE REGISTER UNA",
    "Etudiants": "Students", "Étudiants": "Students", "Docteur": "Doctor",
    "Inscription": "Registration", "Connexion": "Login", "Retour": "Back",
    "Retour à l'accueil": "Back to home", "Retour au menu": "Back to menu", "Déconnexion": "Log out",
    "Nom :": "Last name:", "Prénom(s) :": "First name(s):", "I.P :": "I.P:", "Code :": "Code:",
    "VALIDER": "CONFIRM", "Code": "Code",
    "Inscription réussie, connectez-vous.": "Registration successful, please log in.",
    "Scanner le QR code": "Scan the QR code", "Ou saisir le code affiché :": "Or type the code shown:",
    "Caméra indisponible : saisissez le code manuellement.": "Camera unavailable: please type the code manually.",
    "Présence validée": "Attendance confirmed",
    "Faire l'appel": "Take attendance", "Vérifier les présences": "Check attendance",
    "Nouvel appel": "New attendance session", "Date : JJ/MM/AAAA": "Date: DD/MM/YYYY",
    "Début": "Start", "Fin": "End", "Filière": "Field of study", "Niveau": "Level",
    "Scannez ce QR code": "Scan this QR code",
    "Dates des appels": "Attendance dates", "Aucun appel enregistré.": "No attendance session recorded.",
    "Aucun présent.": "No one present.", "Aucun appel.": "No attendance sessions.",
    "Administration": "Administration", "Codes d'accès": "Access codes",
    "Modifier": "Edit", "Mot de passe": "Password", "Supprimer": "Delete", "Aucun étudiant.": "No students.",
    "Retirer": "Remove", "Ajouter un étudiant (I.P)": "Add a student (I.P)", "Supprimer cet appel": "Delete this session",
    "Corbeille": "Trash", "Profils supprimés": "Deleted profiles", "UE supprimées": "Deleted units (UE)",
    "Appels supprimés": "Deleted sessions", "Restaurer": "Restore", "Supprimer définitivement": "Delete permanently",
    "Aucun.": "None.", "Aucune.": "None.",
    "UE et codes Docteur": "Units (UE) and Doctor codes", "Aucune UE.": "No units (UE).",
    "Renommer": "Rename", "Bloquer l'appel": "Block attendance", "Autoriser l'appel": "Allow attendance",
    "Ajouter une UE": "Add a unit (UE)", "Changer le code Administrateur": "Change the Administrator code",
    "· appel": "· attendance", "· appel autorisé": "· attendance allowed", "bloqué": "blocked", "Appels": "Sessions",
    "Nom de l'UE :": "Name of the unit (UE):", "Code Docteur de cette UE (6 caractères minimum) :": "Doctor code for this unit (6 characters minimum):",
    "Nouveau nom :": "New name:", "Nouveau code (6 caractères minimum) :": "New code (6 characters minimum):",
    "Code modifié.": "Code changed.", "I.P de l'étudiant à ajouter :": "I.P of the student to add:",
    "Supprimer ce profil ? Il ira dans la corbeille (récupérable).": "Delete this profile? It will go to the trash (recoverable).",
    "Supprimer cet appel ? Il ira dans la corbeille.": "Delete this session? It will go to the trash.",
    "Supprimer cette UE ? Elle ira dans la corbeille.": "Delete this unit (UE)? It will go to the trash.",
    "Suppression définitive : impossible à annuler. Continuer ?": "Permanent deletion: this cannot be undone. Continue?",
    "Un appel identique existe déjà. En faire un nouveau ?": "An identical session already exists. Create a new one?",
    "Tous les champs sont obligatoires.": "All fields are required.",
    "Cet I.P est déjà inscrit, veuillez vous connecter.": "This I.P is already registered, please log in.",
    "Cet I.P correspond à un compte supprimé : contactez l'administrateur.": "This I.P matches a deleted account: please contact the administrator.",
    "I.P ou code incorrect.": "Incorrect I.P or code.", "Code incorrect.": "Incorrect code.",
    "Trop d'essais, réessayez dans quelques minutes.": "Too many attempts, please try again in a few minutes.",
    "Accès refusé.": "Access denied.", "L'appel est désactivé par l'administrateur.": "Attendance has been disabled by the administrator.",
    "Date invalide.": "Invalid date.",
    "Intervalle de temps invalide (la fin doit être après le début).": "Invalid time slot (the end must be after the start).",
    "Filière ou niveau invalide.": "Invalid field of study or level.", "Un appel identique existe déjà.": "An identical session already exists.",
    "Session inconnue.": "Unknown session.", "Veuillez vous connecter.": "Please log in.", "Compte introuvable.": "Account not found.",
    "Aucune session d'appel en cours.": "No attendance session in progress.", "QR code expiré, veuillez rescanner.": "QR code expired, please scan again.",
    "Votre présence est déjà enregistrée.": "Your attendance is already recorded.", "Profil introuvable.": "Profile not found.",
    "Introuvable dans la corbeille.": "Not found in the trash.", "Cet I.P existe déjà.": "This I.P already exists.",
    "Appel introuvable.": "Session not found.", "Introuvable.": "Not found.", "I.P inconnu.": "Unknown I.P.", "Déjà présent.": "Already present.",
    "Nom obligatoire et code de 6 caractères minimum.": "A name and a code of at least 6 characters are required.",
    "Ce code est déjà utilisé.": "This code is already in use.", "UE introuvable.": "Unit (UE) not found.",
    "Le code doit contenir au moins 6 caractères.": "The code must contain at least 6 characters.",
    "Le code de cette UE est utilisé par une autre.": "This unit's code is already used by another one.",
    "Erreur serveur.": "Server error.", "Annuler": "Cancel",
    "Délégués": "Class representatives", "Délégué": "Class representative", "Sous-délégué": "Deputy class representative", "Fonction": "Role",
    "Scanner ma présence": "Scan my attendance", "Listes de mon niveau": "Lists for my level", "Appels de mon niveau": "Sessions of my level",
    "Aucune information n'est disponible pour le moment.": "No information is available at the moment.",
    "Inscription réussie. En attendant la validation de l'administrateur, vous êtes considéré comme un étudiant.": "Registration successful. Until the administrator approves it, you are treated as a regular student.",
    "En attente de validation : vous êtes considéré comme un étudiant.": "Pending approval: you are treated as a regular student.",
    "Votre demande de délégué n'a pas été validée.": "Your class representative request has not been approved.",
    "Délégués et sous-délégués": "Class representatives and deputies", "Aucun délégué.": "No class representatives.",
    "Valider Délégué": "Approve as Class representative", "Valider Sous-délégué": "Approve as Deputy", "Refuser": "Reject", "Accès": "Access",
    "en attente": "pending", "refusé": "rejected", "validé comme Délégué": "approved as Class representative", "validé comme Sous-délégué": "approved as Deputy",
    "Supprimer le code": "Delete the code", "Effacer définitivement": "Erase permanently", "Tout bloquer": "Block all", "Tout autoriser": "Allow all", "autorisé": "allowed",
    "Listes des étudiants": "Student lists", "Appels du niveau": "Sessions of the level", "Historique d'un étudiant": "Student history",
    "Fonction, filière ou niveau invalide.": "Invalid role, field of study or level.", "Fonction invalide.": "Invalid role.", "Accès inconnu.": "Unknown access.",
    "Niveau (L1, L2, L3, M1, M2) :": "Level (L1, L2, L3, M1, M2):", "Filière (MI, PC, SN) :": "Field of study (MI, PC, SN):",
    "Supprimer le code de ce profil ? Il ne pourra plus se connecter tant qu'un nouveau code n'est pas défini (Étudiants > Mot de passe).": "Delete this profile's code? It will not be able to log in until a new code is set (Students > Password).",
    "Effacer définitivement ce profil de la base de données ? Impossible à annuler.": "Permanently erase this profile from the database? This cannot be undone.", "Listes par niveau": "Lists by level", "Historique": "History", "Aucune présence.": "No attendance recorded.",
    "· listes autorisées": "· lists allowed", "· listes": "· lists", "bloquées": "blocked", "Bloquer les listes": "Block the lists", "Autoriser les listes": "Allow the lists",
    "Cette fonction est désactivée par l'administrateur.": "This feature has been disabled by the administrator.", "Erreur réseau": "Network error."
  };
  var P = [
    [/^(Délégué|Sous-délégué) · (.+)$/, function (m) { return tr(m[1]) + ' · ' + m[2]; }],
    [/^Délégués et sous-délégués \((\d+)\)$/, function (m) { return 'Class representatives and deputies (' + m[1] + ')'; }],
    [/^· (\d+) en attente$/, function (m) { return '· ' + m[1] + ' pending'; }],
    [/^Niveau : (.+) · Demande : (.+) · Statut : (.+)$/, function (m) { return 'Level: ' + m[1] + ' · Requested: ' + tr(m[2]) + ' · Status: ' + tr(m[3]); }],
    [/^Inscrit le (.+) · (\d+) présence\(s\)$/, function (m) { return 'Registered on ' + m[1] + ' · ' + m[2] + ' attendance(s)'; }],
    [/^Accès : Listes (.) · Appels (.) · Historique (.)$/, function (m) { return 'Access: Lists ' + m[1] + ' · Sessions ' + m[2] + ' · History ' + m[3]; }],
    [/^(Listes des étudiants|Appels du niveau|Historique d'un étudiant) : (autorisé|bloqué)$/, function (m) { return tr(m[1]) + ': ' + tr(m[2]); }],
    [/^(\d+) appel\(s\)$/, function (m) { return m[1] + ' session(s)'; }],
    [/^(\d+) présence\(s\) sur (\d+)$/, function (m) { return m[1] + ' attendance(s) out of ' + m[2]; }],
    [/^(.+) · (\d+) présence\(s\)$/, function (m) { return m[1] + ' · ' + m[2] + ' attendance(s)'; }],
    [/^UE : (.+)$/, function (m) { return 'UE: ' + m[1]; }],
    [/^(.+) \((\d+) appel\(s\)\)$/, function (m) { return m[1] + ' (' + m[2] + ' session(s))'; }],
    [/^(.+) \((\d+) présents\)$/, function (m) { return m[1] + ' (' + m[2] + ' present)'; }],
    [/^Appels du (.+)$/, function (m) { return 'Sessions of ' + m[1]; }],
    [/^Présents du (.+)$/, function (m) { return 'Present on ' + m[1]; }],
    [/^IP ETUDIANT: (.*) \| NOM: (.*) \| PRENOM\(S\): (.*)$/, function (m) { return 'STUDENT I.P: ' + m[1] + ' | LAST NAME: ' + m[2] + ' | FIRST NAME(S): ' + m[3]; }],
    [/^Étudiants \((\d+)\)$/, function (m) { return 'Students (' + m[1] + ')'; }],
    [/^Appels \((\d+)\)$/, function (m) { return 'Sessions (' + m[1] + ')'; }],
    [/^UE et codes Docteur \((\d+)\)$/, function (m) { return 'Units (UE) and Doctor codes (' + m[1] + ')'; }],
    [/^Corbeille \((\d+)\)$/, function (m) { return 'Trash (' + m[1] + ')'; }],
    [/^Nouveau code pour (.+) :$/, function (m) { return 'New code for ' + m[1] + ':'; }]
  ];

  function tr(s) {
    var t = String(s).trim(); if (!t) return s;
    var r = Object.prototype.hasOwnProperty.call(D, t) ? D[t] : undefined;
    if (r === undefined) for (var i = 0; i < P.length; i++) { var m = t.match(P[i][0]); if (m) { r = P[i][1](m); break; } }
    if (r === undefined) return s;
    var at = String(s).indexOf(t);
    return String(s).slice(0, at) + r + String(s).slice(at + t.length);
  }
  if (typeof module !== 'undefined') { module.exports = { tr: tr }; return; }

  var recs = new WeakMap(), btn;
  function skip(n) { var p = n.parentNode; return !p || /^(SCRIPT|STYLE)$/.test(p.nodeName) || (btn && (n === btn.firstChild)); }
  function handle(n) {
    if (skip(n)) return;
    var rec = recs.get(n); if (rec && n.nodeValue === rec.shown) return;
    var fr = n.nodeValue, shown = lang === 'en' ? tr(fr) : fr;
    recs.set(n, { fr: fr, shown: shown }); if (shown !== fr) n.nodeValue = shown;
  }
  function walk(root, fn) {
    if (root.nodeType === 3) return fn(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(fn);
  }
  function refresh() {
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'Attendance register UNA' : "Registre d'appel UNA";
    if (btn) { btn.firstChild.nodeValue = lang === 'en' ? 'FR' : 'EN'; btn.title = lang === 'en' ? 'Passer en français' : 'Switch to English'; }
    walk(document.body, function (n) {
      if (skip(n)) return;
      var rec = recs.get(n), fr = rec ? rec.fr : n.nodeValue;
      if (rec && n.nodeValue !== rec.shown) fr = n.nodeValue;
      var shown = lang === 'en' ? tr(fr) : fr; recs.set(n, { fr: fr, shown: shown }); n.nodeValue = shown;
    });
  }
  ['alert', 'confirm', 'prompt'].forEach(function (k) {
    var f = window[k];
    window[k] = function () { var a = [].slice.call(arguments); if (lang === 'en' && a.length) a[0] = tr(a[0]); return f.apply(window, a); };
  });
  function start() {
    btn = document.createElement('button'); btn.type = 'button'; btn.appendChild(document.createTextNode(''));
    btn.setAttribute('style', 'position:fixed;top:10px;right:10px;z-index:20;width:auto;margin:0;padding:6px 12px;background:#fff;color:#0b7a3b;border:0;border-radius:16px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 2px 6px #0004');
    btn.onclick = function () { lang = lang === 'en' ? 'fr' : 'en'; try { localStorage.setItem(KEY, lang); } catch (e) {} refresh(); };
    document.body.appendChild(btn); refresh();
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'characterData') handle(m.target);
        else m.addedNodes.forEach(function (n) { if (n !== btn) walk(n, handle); });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
