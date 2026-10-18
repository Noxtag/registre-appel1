# Registre d'appel MI-L1

Application web de gestion des présences par QR code (étudiants, Docteurs par UE, administrateur).

## Contenu du dossier
- `server.js` : le serveur (inscription, connexion, QR code, présences, administration)
- `public/index.html` : l'interface (le dossier `public` est obligatoire)
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
- Derrière Caddy, le blocage après 5 essais ratés s'applique à l'adresse du serveur et non à celle de l'utilisateur : c'est acceptable pour un usage interne.

## Fonctionnement
- Étudiants : inscription (un I.P ne peut s'inscrire qu'une fois), connexion, scan du QR code, validation.
- Docteur (une interface par UE) : faire l'appel (date, heures de début et de fin, filière MI/PC/SN, niveau L1 à M2, plusieurs appels par jour), QR code renouvelé toutes les 15 secondes pendant 3 minutes, consultation des présences par date puis par appel.
- Administrateur : gérer les étudiants (modifier, changer le mot de passe, supprimer), les appels (retirer ou ajouter un présent, supprimer), les UE (ajouter, renommer, changer le code, bloquer ou autoriser l'appel, supprimer), la corbeille (restaurer ou supprimer définitivement) et le code administrateur.
