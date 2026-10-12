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

Content env vars (names only — values live in `.env` locally and in Vercel):
`VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`. CI sets them inline since
they are public identifiers, not secrets.

## Layout

The site is her archive: every post and story she made, a page per year.
Design and content model: `docs/superpowers/specs/2026-10-11-archive-garden-design.md`.

- `src/routes/+layout.server.ts` — `prerender = true` and `csr = false` for the
  whole site: static HTML, no JavaScript shipped. Keep it that way; anything that
  needs script or a server (the future edit mode) opts out per route.
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
  lazy loading, intrinsic size) and `Blocks.svelte` (Bleed, Stagger pair, Title page).
- `src/routes/styles.css` — tokens (four colours, three typefaces) and the few
  shared classes. Layout CSS lives with its component.

Every route is prerendered at build time, so `pnpm build` fetches live content
from the public dataset. The public dataset holds only pieces cleared to be seen;
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
colour except the photographs; IM Fell English, Spectral and IBM Plex Mono;
nothing moves; no dark theme; no em dashes in copy.

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
