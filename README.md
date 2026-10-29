# Mana Core docs

The docs site and extension index for [Mana Core](https://github.com/Mana-Core), built with VitePress.

## Develop

```sh
npm install
npm run sync      # fetch extension metadata into docs/.vitepress/data/extensions.json
npm run dev       # http://localhost:5173
```

`npm run sync` uses the GitHub API; set `GITHUB_TOKEN` to avoid the anonymous rate limit.

## Listing extension repositories

- **Org repos**: every non-archived repo in `Mana-Core` is picked up automatically, except the docs repo and anything listed under `exclude` in [`registry.json`](registry.json).
- **Overrides**: add an entry under `repos` in [`registry.json`](registry.json) to change one repo's settings (`repo`, optional `branch`, `category`, `installUrl`, `sourcesDir`, `exclude`, `name`, `description`, `slug`). Here `exclude` lists folders under `sourcesDir` that aren't sources, such as a shared `lib`.

Source metadata is parsed statically from each `SourceInfo` object in `src/sources/<Name>/`; nothing from extension repos is executed.

## Deploy to GitHub Pages

1. Push this repo to the org, ideally as **`Mana-Core.github.io`** so the site is served at `https://mana-core.github.io/`. Any other name works too and is served at `/<repo>/`; the workflow sets the base path for you.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. [`deploy.yml`](.github/workflows/deploy.yml) syncs the index, builds and deploys. It also runs daily, on demand, and on a `repository_dispatch` of type `extensions-updated`, so extension repos can trigger a refresh after they publish.

## Layout

```txt
registry.json                     repos to list (plus auto-discovered org repos)
scripts/sync.mjs                  builds extensions.json from GitHub
docs/
  index.md                        home
  extensions/index.md             repository index
  extensions/sources.md           search across all sources
  guide/, faq.md                  docs pages
  .vitepress/config.mts           site config and sidebar
  .vitepress/theme/               custom theme, settings panel, components
```
