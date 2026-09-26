# AGENTS.md — d-ana

Deana's personal site, **https://d-ana.com**. SvelteKit (Svelte 5, runes) +
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

- `src/routes/+layout.server.ts` — site settings (GROQ), prerendered.
- `src/routes/+page.*` — home (hero video, gallery, bio, thoughts list).
- `src/routes/thoughts/[handle]/+page.*` — a post; unknown handles 404.
- `src/lib/utils/sanity.ts` — Sanity client + `urlFor` image helper.
- `src/lib/types.ts` — shapes of the GROQ projections the templates read.
- `src/routes/styles.css` — Tailwind v4 `@theme` + global/Portable Text styles
  (includes a small v3-parity block; don't drop it without a visual pass).

Every route is prerendered at build time, so `pnpm build` fetches live content
from the public dataset.

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

## Visual parity

Site work ends with a visual pass against prod (https://d-ana.com): run
`pnpm build && pnpm preview` and compare home + a `/thoughts/<handle>` page at
desktop and mobile widths. A config-only / upgrade PR must render
pixel-identical.

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
