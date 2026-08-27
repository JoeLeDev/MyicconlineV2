# My ICC Online V2

Front Next.js (React) pour la vitrine + blog d’**ICC Online**.  
WordPress reste le backend (API REST) sur cPanel — ce dépôt ne remplace pas BuddyPress / LearnPress / la communauté.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Contenu blog via WordPress REST API (`/wp-json/wp/v2/...`)
- Déploiement prévu sur **Vercel** (URL preview tant que le domaine prod n’est pas basculé)

## Pages (phase 1)

| Route | Description |
|-------|-------------|
| `/` | Accueil (hero vidéo, famille connectée, rejoindre la communauté) |
| `/a-propos` | Présentation ICC Online |
| `/blog` | Liste des articles |
| `/blog/[slug]` | Article (YouTube, PDF, articles liés) |
| `/contact` | Formulaire de contact |
| `/connexion` | Connexion JWT WordPress |
| `/espace` | Espace membre (protégé) |
| `/mentions-legales` | Mentions légales |
| `/politique-de-confidentialite` | Politique de confidentialité RGPD |

## Prérequis

- Node.js 20+
- Accès réseau à `https://myicconline.com`

## Setup local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d’environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_WP_URL` | URL du WordPress (API) | `https://myicconline.com` |
| `NEXT_PUBLIC_WP_LOGIN_URL` | Lien « Je me connecte » (reste sur WP) | `https://myicconline.com/` |
| `NEXT_PUBLIC_SITE_URL` | URL canonique du front (SEO / OG) | optionnel |
| `AUTH_SECRET` | Secret HMAC session (`openssl rand -base64 48`) | **requis pour l’auth** |
| `RESEND_API_KEY` | Clé API Resend pour le formulaire contact | optionnel |
| `CONTACT_TO_EMAIL` | Destinataire des messages contact | `netezoua@yahoo.fr` |
| `CONTACT_FROM_EMAIL` | Expéditeur Resend (domaine vérifié) | `ICC Online <onboarding@resend.dev>` |

## Blog & champ `icc_editorial`

Le front consomme les posts natifs WP via `/wp-json/wp/v2/posts?_embed` et privilégie le champ enrichi :

```json
"icc_editorial": {
  "youtube_url": "https://www.youtube.com/watch?v=…",
  "youtube_id": "…",
  "files": [{ "url": "…", "title": "…", "extension": "pdf", "filesize": 12345 }],
  "reading_time": "1 min de lecture"
}
```

Fallbacks (si `icc_editorial` vide) : `meta._myicc_youtube_url` / `meta._myicc_attached_files`, puis extraction HTML.  
Les images `.pdf` cassées dans le contenu HTML sont filtrées.
## Déploiement Vercel

1. Importer le repo GitHub dans Vercel
2. Framework : **Next.js** (détecté automatiquement)
3. Ajouter les variables d’env (Production + Preview) :
   - `NEXT_PUBLIC_WP_URL=https://myicconline.com`
   - `NEXT_PUBLIC_WP_LOGIN_URL=https://myicconline.com/`
4. Déployer — utiliser l’URL `*.vercel.app` tant que `myicconline.com` pointe encore vers WordPress

Ne **pas** placer ce front dans `wp-content` / cPanel.

## Auth (phase 2)

Connexion via le plugin WordPress `jwt-auth` :

- `POST /api/auth/login` → cookies httpOnly `icc_wp_token` + `icc_session` (HMAC)
- Rate limit : 5 tentatives / 15 min / IP
- Contrôle Origin/Referer (anti-CSRF)
- Erreurs de login génériques (pas d’énumération d’utilisateurs)
- `POST /api/auth/logout`
- `GET /api/auth/me` (revalide JWT WP + session signée)
- Pages : `/connexion`, `/espace` (proxy vérifie la session signée)

`AUTH_SECRET` est **obligatoire** (Vercel + `.env.local`).

## Contact

Le formulaire `/contact` appelle `POST /api/contact` (Resend).  
Sans `RESEND_API_KEY`, fallback automatique vers `mailto:`.

Sur Vercel, ajouter `RESEND_API_KEY`, `CONTACT_TO_EMAIL` et idéalement un `CONTACT_FROM_EMAIL` avec domaine vérifié.

## Scripts

```bash
npm run dev      # développement
npm run build    # build production
npm run start    # serveur prod local
npm run lint     # ESLint
```

## Structure

```
src/
  app/                 # routes App Router (+ sitemap.xml, robots.txt)
  components/          # UI (layout, home, blog, legal)
  lib/wp/              # client + mapping API WordPress
  lib/utils/           # dates, HTML, temps de lecture
```

## Identité visuelle

- Couleurs : noir / blanc / accent bleu `#1894be`
- Typo : Poppins
- Logo & assets : hébergés sur le WordPress existant
