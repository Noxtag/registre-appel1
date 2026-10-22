# Registre d'appel UNA

Application web de gestion des présences par QR code (étudiants, délégués et sous-délégués, Docteurs par UE, administrateur).

## Contenu du dossier
- `public/fond.jpg` : image d'arrière-plan de toutes les pages (portail de l'Université Nangui Abrogoua)
- `public/i18n.js` : traduction Français / English (bouton EN/FR en haut à droite ; français par défaut)
- `server.js` : le serveur (inscription, connexion, QR code, présences, administration)
- `public/index.html` : l'interface (inclut la bascule de langue) (le dossier `public` est obligatoire)
- `package.json` : commande de démarrage
- `data.json` : créé automatiquement au premier lancement (c'est toute la base de données)

## Accès
Un seul écran de connexion : Accueil > Docteur. Le code saisi décide de l'interface ouverte.

| Code saisi | Interface ouverte |
|---|---|
| `Univ-UNA.CI225` | Docteur de l'UE « Général » (créée par défaut) |
| Code d'une UE créée par l'administrateur | Docteur de cette UE |
| `Admin-MI-L12026` | Administration |

Changez le code administrateur dès la première connexion (Administration > Codes d'accès), puis retirez ce tableau de ce fichier.
Pour choisir le code administrateur dès le premier lancement : `ADMIN_CODE="MonCode" node server.js` (Windows PowerShell : `$env:ADMIN_CODE="MonCode"; node server.js`).
Les codes sont stockés hachés. Après 5 essais ratés, l'accès est bloqué 5 minutes.

## 1. Sur votre propre machine
1. Installer Node.js 18 ou plus récent (nodejs.org, version LTS).
2. Ouvrir un terminal dans ce dossier et lancer : `node server.js`
3. Ouvrir http://localhost:3000
Arrêt : `Ctrl + C`. Autre port : `PORT=8080 node server.js`.

Pour que les téléphones du même Wi-Fi s'y connectent : http://ADRESSE-IP-DE-LA-MACHINE:3000. En http (sans cadenas), les navigateurs bloquent la caméra : les étudiants saisissent alors le code affiché à la main. Pour utiliser la caméra, passez en HTTPS (étape 2).

## 2. Sur votre propre serveur (HTTPS, caméra active)
1. Louer un petit serveur Linux (VPS) et un nom de domaine pointant vers lui (enregistrement A), par exemple `appel.votre-domaine.ci`.
2. Installer Node.js 18+ et copier ce dossier sur le serveur.
3. Garder l'application allumée en permanence :
   `npm install -g pm2` puis `pm2 start server.js --name registre-appel` puis `pm2 save` et `pm2 startup`.
4. Installer Caddy (caddyserver.com) et créer le fichier `Caddyfile` :
```
appel.votre-domaine.ci {
    reverse_proxy localhost:3000
}
```
   Caddy obtient et renouvelle seul le certificat HTTPS. Lancer : `caddy run` (ou le service Caddy).
5. Ouvrir `https://appel.votre-domaine.ci`.

Ouvrir uniquement les ports 80 et 443 du pare-feu (le port 3000 ne doit pas être exposé).

## Sauvegarde et maintenance
- Copiez régulièrement `data.json` : sans lui, les comptes et présences sont perdus.
- Mise à jour : remplacer `server.js` et `public/index.html`, puis `pm2 restart registre-appel`. Les données sont conservées.
- Les bibliothèques de scan et de génération de QR code sont chargées depuis Internet (cdnjs) : le serveur et les téléphones doivent avoir une connexion.
- Variables utiles : `PORT` (port d'écoute), `ADMIN_CODE` (code administrateur initial), `DATA_FILE` (emplacement de `data.json`, par exemple `/data/data.json` sur un disque persistant).

## Fonctionnement
- Étudiants : inscription (un I.P ne peut s'inscrire qu'une fois), connexion, scan du QR code, validation.
- Docteur (une interface par UE) : listes par niveau (étudiants présents aux appels de son UE, historique d'un étudiant dans son UE) ; accès retirable par l'administrateur. Aussi : faire l'appel (date, heures de début et de fin, filière MI/PC/SN, niveau L1 à M2, plusieurs appels par jour), QR code renouvelé toutes les 15 secondes pendant 3 minutes, consultation des présences par date puis par appel.
- Administrateur : listes par niveau sur toutes les UE, historique complet d'un étudiant (cours suivis, dates, UE, filière, niveau), blocage des listes par UE ; gérer les étudiants (modifier, changer le mot de passe, supprimer), les appels (retirer ou ajouter un présent, supprimer), les UE (ajouter, renommer, changer le code, bloquer ou autoriser l'appel, supprimer), la corbeille (restaurer ou supprimer définitivement) et le code administrateur.

## Listes par niveau et historique
- Source : les appels enregistrés. Pour chaque combinaison niveau + filière (ex. « L1 MI »), on voit les étudiants présents au moins une fois et leur nombre de présences sur le nombre d'appels ; un clic ouvre l'historique de l'étudiant (date, UE, filière, niveau, horaire).
- Docteur : uniquement les appels de son UE. Administrateur : toutes les UE, et bouton « Historique » dans la liste des étudiants.
- L'administrateur peut bloquer ou autoriser cette fonction UE par UE (UE et codes Docteur > « Bloquer les listes »). Le bouton disparaît alors du menu du Docteur.
- Limite : l'inscription ne demande ni filière ni niveau. On ne connaît donc que les appels auxquels l'étudiant a participé ; les absences ne peuvent pas être calculées.

## Hébergement avec GitHub + Render
- Fichiers à déposer sur GitHub : `server.js`, `package.json`, `.gitignore`, `README.md` et le dossier `public` (`index.html`, `i18n.js` et `fond.jpg`).
- Sans disque persistant, `data.json` est effacé à chaque redémarrage : sur Render, ajoutez un disque et la variable `DATA_FILE=/data/data.json`.

## Délégués et sous-délégués
- Accueil > Délégués > Inscription : nom, prénom(s), I.P, code (choisi par la personne), fonction (Délégué ou Sous-délégué), filière et niveau. Le même I.P ne peut pas s'inscrire deux fois.
- En attendant la validation de l'administrateur, la personne est traitée comme un simple étudiant : elle se connecte (Délégués > Connexion ou Étudiants > Connexion) et peut scanner. Un délégué doit toujours scanner pour être présent.
- Administration > Délégués et sous-délégués : voir toutes les informations (I.P, nom, fonction demandée, niveau, statut, date d'inscription, nombre de présences, historique), valider comme Délégué ou comme Sous-délégué, refuser, corriger le niveau/la filière, supprimer le code, supprimer (corbeille) ou effacer définitivement.
- Après validation, le délégué voit son menu : Scanner ma présence, Listes de mon niveau, Appels de mon niveau (tous les appels de son niveau et de sa filière, toutes UE confondues), et l'historique d'un étudiant (uniquement dans son niveau).
- L'administrateur peut bloquer, délégué par délégué : les listes, les appels, l'historique, ou tout (bouton Accès). Un accès bloqué n'apparaît plus dans le menu et est refusé par le serveur.
- « Supprimer le code » empêche toute connexion jusqu'à ce qu'un nouveau code soit défini (Administration > Étudiants > Mot de passe). « Effacer définitivement » retire le profil de la base ; ses présences passées restent, sous « profil inconnu ».
