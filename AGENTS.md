# AGENTS.md — d-ana

Deana's personal site, **https://d-ana.com**. SvelteKit 3 (Svelte 5, runes) +
Tailwind v4, content from Sanity, deployed on Vercel.

## Where everything lives

| Thing                    | Value                                                                  |
| ------------------------ | ---------------------------------------------------------------------- |
| Repo                     | `github.com/threesam/d_ana` (default branch `main`)                    |
| Sanity Studio            | separate repo, `github.com/threesam/d-ana_studio` (schemas live there) |
| Sanity project / dataset | `elspywtm` / `production` (public, read via `useCdn: false`)           |
| Hosting                  | Vercel project `d-ana` (scope `threesam`), Node 22.x                   |
| Deploys                  | Vercel Git integration: merge to `main` ships prod; PRs get previews   |
| Analytics                | umami at `analytics.sixtom.com`, site `d-ana.com` (see Counting)       |

Content env vars (names only — values live in `.env` locally and in Vercel):
`VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`. CI sets them inline since
they are public identifiers, not secrets.

## Layout

The site is her archive: every post and story she made, a page per year.
Design and content model: `docs/superpowers/specs/2026-10-11-archive-garden-design.md`.

- `src/routes/+layout.server.ts` — `prerender = true` and `csr = false` for the
  whole site: static HTML, no framework JavaScript shipped. The site's own script is a
  few inline lines in `src/app.html` with three jobs: it plays a video while it is on
  screen, on a year page it moves the sticky row of months with the page (the row
  is a strip that scrolls sideways, so a swipe moves it too), and it counts what a
  visitor does (see Counting). The only script file is the umami tracker, which that
  script adds after the page has loaded. Keep it that way; anything that needs more
  script or a server (the future edit mode) opts out per route.
- `src/routes/+page.*` — home: the title page and the index of years and themes.
- `src/routes/[year=year]/` — a year, month by month. `src/params.ts` holds the
  `year` matcher, so `/2019` is a year and anything else 404s.
- `src/routes/theme/[handle]/` — one theme across years. `src/routes/places/` — the map.
- `src/lib/content/` — pure logic, unit tested: `compose.ts` (which layout each
  photograph gets), `image.ts` (the Sanity CDN `srcset` ladder), `places.ts` (the
  pin board: whole world, never zoomed), `index.ts` (year summaries, date labels), `types.ts`.
- `src/lib/server/content.ts` — the Sanity client and every GROQ query. Server
  only. Every query filters on `visibility == "shown"`; never add one that doesn't.
- `src/lib/components/` — `Photo.svelte` (the only `<img>`: `srcset`, `sizes`,
  lazy loading, intrinsic size), `Blocks.svelte` (Bleed, Stagger pair, Title page) and
  `Head.svelte` (a page's title, description, one address and the card a shared link
  shows: every page uses it instead of its own `<svelte:head>`).
- `src/routes/+layout.server.ts` also loads every year and theme for the lists at the
  foot of each page. `src/routes/sitemap.xml/` is the sitemap.
- `src/routes/styles.css` — tokens (four colours, three typefaces) and the few
  shared classes. Layout CSS lives with its component.

Every route is prerendered at build time, so `pnpm build` fetches live content
from the public dataset. A question every page asks (the years, the themes) is put to
Sanity once a build (`once()` in `server/content.ts`). The one page drawn at request
time is the 404, and it must never query Sanity: guard any new layout data the way
`+layout.server.ts` does. The public dataset holds only pieces cleared to be seen;
new work lands in a private dataset first and is copied over once tagged. The site
never needs a token.

## Code style

- **No nested ternaries.** Split into named variables, an `if`, or a helper.
  A single ternary is fine.

## Strictness gates (CI-enforced — keep them green)

Every change must pass all four before commit; CI re-runs them on every PR:

```bash
pnpm check   # svelte-check, strict tsconfig, --fail-on-warnings (0 warnings allowed)
pnpm lint    # prettier --check + eslint strictTypeChecked flat config
pnpm test    # vitest unit suite
pnpm build   # vite production build (prerenders from Sanity)
```

- The tsconfig carries the full hardening set (`noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noUnusedLocals/Parameters`, …). Don't loosen
  a flag to make an error go away — fix the code site.
- `!` (non-null assertion) is allowed **only** where the invariant is locally
  provable (bounded loop index, regex group after a match). If flow can't
  prove it, guard instead.
- Rule disables need an inline `--` reason, same line. No file-wide disables.
- Optional props/params under `exactOptionalPropertyTypes` are declared
  `prop?: T | undefined` — that's the contract, not a typo.

## Red–green TDD

New behavior in pure logic (`src/lib/**/*.ts`) follows red–green:

1. **Red** — write the failing unit test first (`<module>.test.ts`,
   colocated, vitest). Run `pnpm test` and see it fail for the right reason.
2. **Green** — minimal change to pass.
3. **Refactor** — with the test holding the behavior.

Bug fixes start with the reproducing test. Harness layout: vitest for pure
logic (`pnpm test`, no browser); Playwright for browser behavior
(`pnpm test:e2e`, `tests/*.spec.ts`). Don't put pure-function assertions in
Playwright specs.

## Svelte: use the Svelte MCP, every time

Any change to a `.svelte` / `.svelte.ts` file goes through the official Svelte
MCP (`svelte` server), not memory:

- **Before writing:** `list-sections` → `get-documentation` for the APIs you're
  touching (runes, `{@attach}`, snippets, `$app/state`, form actions…). Svelte 5
  and Kit move fast; training data lags.
- **After writing:** run `svelte-autofixer` on every component you created or
  changed, fix what it reports, and re-run until it comes back clean. Do this
  before `pnpm check`, not instead of it.

## Visual pass

Site work ends with a look at the real thing: `pnpm build && pnpm preview`, then
home, a full year and `/places` at desktop (1440) and phone (390) widths. Check
that nothing scrolls sideways, every photograph has its place held before it
loads, and Lighthouse accessibility is 100.

Design rules that are decisions, not taste to revisit: white page, black type, no
colour except the photographs; Poiret One (titles, upright only: it has no italic), Spectral and IBM Plex Mono;
nothing moves; no dark theme; no em dashes in copy.

## Speed

The site is media heavy and scores 100 on Lighthouse in all four categories, phone and
desktop. Keep it there:

- **Everything is static and on a CDN.** HTML from Vercel's edge, photographs and
  videos from `cdn.sanity.io` (cached a year). Visitors never call the Sanity API.
  The build does, with `useCdn: false`, which is right for a static build: it must
  see what was just changed. Do not add a fetch that runs in the browser.
- **CSS is inlined** (`inlineStyleThreshold` in `vite.config.ts`). `src/hooks.server.ts`
  repairs the font addresses SvelteKit 3.0.1 leaves relative in the inlined CSS when
  there is no client build. Delete the hook once SvelteKit does it; the smoke test
  "the type faces load" tells you when that is safe (it fails if a face 404s).
- **The three first-screen faces are inside the CSS** (`assetsInlineLimit` in
  `vite.config.ts`): the title face, the reading face at 300 and the date face, latin
  only, 45 KB. As files they raced the first paint. A phone's largest paint (a title)
  was counted only once its face arrived, and the reading and date faces arriving after
  the paint laid a whole year out again. Google read 98 or 99 instead of 100 for either.
  The smoke test fails if one is ever fetched as a file (a `@fontsource` upgrade can
  rename them). Italics, 400 and other alphabets stay files: no first screen needs them.
- **`sizes()` in `content/image.ts` mirrors the grid in `Blocks.svelte`** and the
  thumbnail height in `routes/+page.svelte`. Change a column or a height cap in one
  and you must change the other, or browsers fetch the wrong file.
- **A video fetches nothing until it plays** (`preload="none"`, no `poster`: the still
  is an ordinary lazy `<img>` under it).
- **Measure before and after** any change to layout, images or fonts:
  `pnpm build && pnpm preview`, then Lighthouse with `--form-factor=mobile` and with
  `--preset=desktop` on `/`, a full year, a theme and `/places`. Run it with nothing
  else busy on the machine: a build or a test run alongside costs points.
- **On the real host, measure a Vercel preview like this**, or it reads worse than
  production will:
  `--extra-headers='{"x-vercel-skip-toolbar":"1"}'` and
  `--chrome-flags="--headless=new --disable-features=Translate,OptimizationHints,MediaRouter,DialMediaRouteProvider,CalculateNativeWinOcclusion,InterestFeedContentSuggestions,CertificateTransparencyComponentUpdater,AutofillServerCommunication,PrivacySandboxSettings4"`.
  Three things skew a preview. Vercel adds its toolbar script (previews only). It also
  sends `x-robots-tag: noindex` (previews only), so SEO cannot be 100 there. And the
  Lighthouse CLI's own launcher switches off Chrome's `RenderDocument`, which no
  visitor's Chrome does: with it off, Chrome holds this site's first paint for a second
  or two on most runs (1.3 s against 0.3 s). The list above is the launcher's own, minus
  that one.
- **Real host, 2026-10-12:** desktop 100 on all five pages. Phone 100 on 2024, a theme
  and places, and 98 on home and on 2018. What is left: a type face that lands before
  the first paint is counted against it (home), and the faces arriving after it lay the
  longest year out a second time (2018). Both are about how the faces load.

## Counting

umami on Sam's server, website id in `src/app.html`. The spec has the full list of what
is counted and why it is built this way. The rules that bite:

- **Never put `data-umami-event` on a link.** The tracker then holds the click until its
  request has come back, and a slow analytics server would hold the site's links. Clicks
  are said from the inline script instead (`say()`), and every link is counted without
  markup: the name comes from where the link goes.
- **`data-via="name"`** on a container says where its links are (`top`, `foot`, `list`,
  `row`, `beside`, …). **`data-seen="name"`** on an element counts it once it has stayed on screen
  for two seconds (an `id`, if it has one, goes along).
- **The tracker is added after `load`, and not while Chrome is prerendering.** Do not
  move it into the head: the page would wait on Sam's server, and a hovered link would
  count as a visit.
- **Only `d-ana.com` counts** (`data-domains`). To see events while working, run
  `tests/analytics.spec.ts`, which stands in for the tracker.
- **`?test` on any address takes your browser out of the count; `?test=0` puts it back.**
  Use it before clicking around the live site.
- umami drops visits from headless browsers (it answers 200 and stores nothing), so an
  automated check against the real server needs an ordinary browser name.

## Content changes and deploys

The Sanity project has a webhook named `Vercel` that calls a Vercel deploy hook to
rebuild `main`. It is **switched off** (2026-10-12): it fired once for every document in
every dataset, so the archive import asked for a production build per document, every
one failed against the old `main`, and the account's daily allowance of 100 deployments
went with them: Vercel refused every preview here and on the Studio until the webhook
was switched off twelve hours later. Before a bulk write to Sanity, check it is still
off. When it goes back on it should watch the `production` dataset only.

## Conventions

- **Pin exact versions** — no `^`/`~` anywhere in `package.json` (incl.
  overrides). `.npmrc` has `save-exact=true`; `pnpm-lock.yaml` is the source of
  truth. Don't bump deps as a side effect of unrelated work.
- **pnpm only** (`packageManager` in `package.json`); CI installs with
  `--frozen-lockfile`.
- **Never squash-merge** — merge commit or rebase; preserve history.
- **No secrets in the repo.** `.env*` is gitignored; never print or commit
  tokens. Env values belong in Vercel.
- **Vercel:** the project lives on the personal `threesam` account (the CLI
  rejects `--scope` for personal accounts; check `vercel whoami`). Never touch
  the other teams. Never `vercel deploy --prod` — prod ships by merging to `main`.
