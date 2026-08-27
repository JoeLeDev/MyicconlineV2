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
| `/` | Accueil (hero, famille connectée, rejoindre la communauté, articles à la une) |
| `/a-propos` | Présentation ICC Online |
| `/blog` | Liste des articles |
| `/blog/[slug]` | Article (YouTube, PDF, articles liés) |
| `/contact` | Formulaire de contact (vitrine) |

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

## Blog & métas WordPress

Le front consomme les posts natifs WP et lit, si exposées dans `meta` :

- `_myicc_youtube_url` ou `usp_youtube_url` → embed YouTube
- `_myicc_attached_files` → IDs média (PDF, etc.)

Sinon, fallback : extraction YouTube / PDF depuis le contenu HTML, et médias `parent` du post.  
Les images `.pdf` cassées dans le contenu HTML sont filtrées.

> Pour exposer les metas custom dans l’API REST, enregistrer les champs avec `show_in_rest` côté WordPress (plugin / `register_post_meta`).

## Déploiement Vercel

1. Importer le repo GitHub dans Vercel
2. Framework : **Next.js** (détecté automatiquement)
3. Ajouter les variables d’env (Production + Preview) :
   - `NEXT_PUBLIC_WP_URL=https://myicconline.com`
   - `NEXT_PUBLIC_WP_LOGIN_URL=https://myicconline.com/`
4. Déployer — utiliser l’URL `*.vercel.app` tant que `myicconline.com` pointe encore vers WordPress

Ne **pas** placer ce front dans `wp-content` / cPanel.

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
  app/                 # routes App Router
  components/          # UI (layout, home, blog)
  lib/wp/              # client + mapping API WordPress
  lib/utils/           # dates, HTML, temps de lecture
```

## Identité visuelle

- Couleurs : noir / blanc / accent corail `#E55B48`
- Typo : Poppins
- Logo & assets : hébergés sur le WordPress existant
