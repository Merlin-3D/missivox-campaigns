# Missivox

Application d'emailing pour écrire à ses clients : contacts et listes, éditeur
d'email visuel ou HTML, envoi programmé et cadencé, suivi des ouvertures, des
clics et des désinscriptions.

Construite avec AdonisJS 7, Inertia + React et SQLite.

## Fonctionnalités

- **Contacts** : ajout manuel, import CSV (Excel FR ou EN, `,` ou `;`), export
  CSV, champs personnalisés, recherche, filtres, actions groupées.
- **Listes** : un contact peut être dans plusieurs listes ; il ne reçoit
  qu'un seul exemplaire d'une campagne.
- **Modèles** : emails réutilisables comme point de départ des campagnes.
- **Campagnes** :
  - éditeur visuel (TipTap) ou HTML, avec aperçu en direct ordinateur ou mobile ;
  - variables `{{ first_name }}`, `{{ attr.ville }}`, valeur par défaut
    `{{ first_name | "cher client" }}` ;
  - email de test ;
  - envoi immédiat ou programmé, pause, reprise et annulation.
- **Envoi fiable** : file d'attente en base, cadence réglable, nouvelles
  tentatives (1, 5 puis 15 min), reprise après un arrêt, adresses rejetées
  marquées « invalides ».
- **Suivi** : ouvertures (pixel), clics (liens redirigés), désinscription en un
  clic (en-têtes `List-Unsubscribe` RFC 8058), version « voir en ligne ».
- **Conformité** : pied de page légal et lien de désinscription ajoutés à
  chaque email ; les contacts désinscrits ne reçoivent plus rien.
- **Comptes et espaces** : chacun peut créer un compte depuis `/signup`. Un
  compte ouvre son propre espace (contacts, listes, modèles, campagnes,
  réglages et serveur SMTP), invisible des autres espaces. Les coéquipiers
  sont ajoutés depuis les réglages et rejoignent l'espace de la personne qui
  les ajoute.

## Démarrer en local

Prérequis : Node.js 24 et Docker (pour Mailpit).

```bash
npm install
cp .env.example .env
node ace generate:key
node ace migration:run
docker compose up -d          # Mailpit : capture les emails, http://localhost:8025
npm run dev                   # http://localhost:3333
```

À la première visite, l'application propose de créer un compte. Renseignez
ensuite le serveur d'envoi de votre espace dans les réglages (en local :
`localhost`, port `1025`, sans identifiant, pour Mailpit).

Des données de démonstration (compte, contacts, listes, modèle) sont
disponibles :

```bash
node ace db:seed
```

Les identifiants du compte de démonstration sont dans
`database/seeders/demo_seeder.ts`.

## Envoi des emails

Les campagnes ne sont pas envoyées dans la requête HTTP : au départ, les
destinataires sont copiés dans la table `campaign_recipients`, puis un
_worker_ les envoie un par un. Chaque espace envoie à son rythme (réglages)
et par son propre serveur SMTP ; le worker passe d'un espace à l'autre, si
bien qu'une grosse campagne ne bloque pas les autres espaces.

- Par défaut (`CAMPAIGN_WORKER=true`), le worker tourne dans le serveur web.
- En production, on peut le séparer : `CAMPAIGN_WORKER=false` sur le serveur
  web, et un processus dédié :

  ```bash
  node ace campaigns:work
  ```

Plusieurs workers peuvent tourner en même temps : chaque email est
« réservé » avant l'envoi, il ne part jamais deux fois. Si le serveur SMTP est
injoignable, les emails de cet espace patientent 30 secondes sans consommer
les tentatives des destinataires, et l'interface de l'espace affiche l'erreur.

## Configuration

| Variable | Rôle |
| --- | --- |
| `APP_URL` | Adresse publique du site. Elle sert aux liens de suivi, de désinscription et « voir en ligne » : elle doit être joignable par vos destinataires. |
| `DB_FILE` | Fichier SQLite (relatif au projet ou absolu). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD` | Serveur d'envoi de l'installation. Chaque espace renseigne normalement le sien dans ses réglages (mot de passe chiffré avec `APP_KEY`). |
| `SMTP_SHARED` | `true` : les espaces sans serveur à eux envoient par celui de l'installation. Laissez `false` si l'inscription est ouverte au public, sinon n'importe qui enverrait depuis votre compte SMTP. |
| `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS` | Expéditeur par défaut à l'installation (modifiable dans les réglages). |
| `CAMPAIGN_WORKER` | `true` : le serveur web envoie les emails ; `false` : utilisez `node ace campaigns:work`. |

Pour que vos emails n'arrivent pas en spam, configurez SPF, DKIM et DMARC
pour le domaine de l'adresse d'envoi auprès de votre fournisseur SMTP.

## Mise en production

### Image Docker

Le `Dockerfile` construit une image qui contient le serveur web et l'envoi des
emails dans un même processus. Au démarrage, le conteneur applique les
migrations puis lance le serveur sur le port 3333 (`/health` répond quand il
est prêt). La base SQLite est dans `/app/storage` : montez-y un volume, sinon
elle disparaît à chaque redéploiement.

```bash
docker build -t missivox .
docker run -p 3333:3333 -v missivox-data:/app/storage --env-file .env.production missivox
```

### Build sur GitHub

Le workflow `.github/workflows/docker-image.yml` se lance à chaque push :

1. typecheck, lint et tests (seule étape pour les pull requests) ;
2. sur `main` et sur les tags `v*`, build de l'image et push sur
   `ghcr.io/<compte>/<dépôt>`, avec les tags `latest` (main), `sha-<commit>`
   et `1.2.3` pour un tag `v1.2.3` ;
3. sur `main`, si les secrets Dokploy sont renseignés, redéploiement de
   l'application.

### Dokploy

1. **Accès au registre.** L'image d'un dépôt privé est privée. Dans Dokploy,
   Settings → Registry, ajoutez `ghcr.io` avec votre nom d'utilisateur GitHub
   et un token (classic) qui a le droit `read:packages`. Sinon, rendez le
   paquet public dans GitHub (Packages → Package settings).
2. **Application.** Créez une application avec la source **Docker**, l'image
   `ghcr.io/<compte>/<dépôt>:latest` et le registre de l'étape 1.
3. **Variables d'environnement.**

   ```
   APP_KEY=...                 # node ace generate:key --show
   APP_URL=https://missivox.example.com
   MAIL_FROM_ADDRESS=no-reply@example.com
   SMTP_HOST=smtp.example.com
   SMTP_PORT=465
   SMTP_SHARED=false
   ```

   Gardez `APP_KEY` : elle chiffre les sessions et les mots de passe SMTP des
   espaces, en changer les rend illisibles. Les variables `SMTP_*` sont
   obligatoires au démarrage ; avec `SMTP_SHARED=false`, aucun espace n'envoie
   par ce serveur. `NODE_ENV`, `HOST`, `PORT`, `DB_FILE`, `SESSION_DRIVER`,
   `MAIL_MAILER` et `MAIL_FROM_NAME` ont déjà une valeur dans l'image.
4. **Volume.** Advanced → Mounts : un **Volume Mount** vers `/app/storage`.
   Pas de Bind Mount : un dossier de l'hôte appartient à root et le serveur,
   qui ne tourne pas en root, ne pourrait pas y écrire.
5. **Domaine.** Domains : le domaine d'`APP_URL`, port du conteneur `3333`,
   HTTPS avec Let's Encrypt.
6. **Une seule instance.** SQLite n'accepte qu'un serveur à la fois : laissez
   un seul replica.
7. **Redéploiement automatique** (facultatif). Dans GitHub, Settings → Secrets
   and variables → Actions, ajoutez `DOKPLOY_URL` (l'adresse de votre
   Dokploy), `DOKPLOY_API_KEY` (Dokploy → Profile → API/CLI) et
   `DOKPLOY_APPLICATION_ID` (dans l'adresse de la page de l'application). Sans
   ces secrets, cliquez sur Deploy dans Dokploy après chaque build.

Sauvegardez régulièrement le volume : le fichier SQLite et ses fichiers
`-wal` / `-shm`.

### Sans Docker

```bash
npm ci
node ace build
cd build
npm ci --omit=dev
cp ../.env .env               # NODE_ENV=production, APP_URL réel, SMTP réel
node ace migration:run --force
node bin/server.js
```

## Tests

```bash
npm test                      # tests unitaires et fonctionnels (base SQLite dédiée)
npm run typecheck
npm run lint
```

## Organisation du code

| Dossier | Contenu |
| --- | --- |
| `app/services/campaign_dispatcher.ts` | Cycle de vie d'une campagne : programmation, départ, pause, annulation. |
| `app/services/campaign_sender.ts` | Envoi d'un email, nouvelles tentatives, rebonds. |
| `app/services/campaign_worker.ts` | Boucle d'envoi cadencée. |
| `app/services/email_renderer.ts` | Mise en page, CSS en ligne, personnalisation, suivi. |
| `app/services/contact_importer.ts` | Lecture et import des fichiers CSV. |
| `app/services/tracking_service.ts` | Ouvertures, clics, désinscriptions. |
| `inertia/pages` | Pages React. |
| `inertia/components/email_editor.tsx` | Éditeur visuel et HTML. |
