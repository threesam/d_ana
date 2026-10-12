# d-ana.com: the archive as the ground floor

Date: 2026-10-11. Status: draft for review.

## What this is

d-ana.com is rebuilt from nothing around her photographs. The first content is her
Instagram archive (2016 to 2026): every post and story she made, with its date and
her own words. New kinds of content are added later, one at a time, on the same model.

Who it is for: Deana first (a permanent home for work that otherwise lives inside
Instagram), then anyone she sends there.

Success looks like this:

- Every image from the archive is on the site or one tap from being on it.
- She can hide or show any piece without help.
- Nothing showing a child is public unless she chose it.
- A year reads as a story, top to bottom, on a phone.

## Decisions already made

| Decision                                                                                                               | Source          |
| ---------------------------------------------------------------------------------------------------------------------- | --------------- |
| White page, black type, no color except the photographs                                                                | Sam             |
| Type: Poiret One (titles, her pick from the heading picker), Spectral Light (reading), IBM Plex Mono (dates, captions) | Deana           |
| Layouts kept: Bleed, Stagger pair, Title page. Passed: One frame, Indented column, Pulled line                         | Board round two |
| Nothing moves                                                                                                          | Board round one |
| One page per year                                                                                                      | Sam             |
| Pieces showing children are tagged and hidden by default                                                               | Sam             |
| Sanity holds the content; images are served from its CDN, sized per screen, lazy loaded                                | Sam             |
| The route parameter and the Sanity field are named `handle`, never `slug`                                              | Sam             |
| No email capture, no contact form, no About page                                                                       | Sam             |

Design read: a personal archive set like a book and paged by year. White page, black
type, color only from her work.

## Sources

One Instagram export, kept outside git. A local pipeline turns it into a catalog
before anything is sent to Sanity:

1. `manifest`: every post, story and reel with date, text, media, tagged accounts,
   and a place where the photo carried one.
2. `vision`: each image is tagged by a small model: children visible or not, someone
   else's content (a reshare) or hers, one or two subjects, and draft alt text.
3. `themes`: her text is read end to end and grouped into six to ten themes, each
   with a rule that assigns pieces to it.
4. `catalog`: the three merged into the exact documents the site will hold, with the
   default visibility decided.
5. `push`: one lookup, one upload per new image, documents in batches of 100, to a
   named dataset. Re-running it creates only what is missing and never touches an
   existing document. It refuses to send hidden pieces to a public dataset.

Videos are not part of this first pass. A piece that is only a video waits for the
native video work.

## Content model (Sanity)

`post` is one piece: an Instagram post, a story, later an essay or a campaign day.

| Field         | Type                 | Notes                                                                             |
| ------------- | -------------------- | --------------------------------------------------------------------------------- |
| `title`       | string               | Optional. Imported pieces have none.                                              |
| `handle`      | slug                 | Required. Imported: the date plus a short id.                                     |
| `kind`        | string list          | `post`, `story`, `reel`, `essay`.                                                 |
| `publishedAt` | datetime             | When she first published it.                                                      |
| `day`         | date                 | The same moment as a calendar day, for grouping.                                  |
| `text`        | text                 | Her caption or the text she wrote on the story.                                   |
| `body`        | block content        | Optional, for long writing.                                                       |
| `images[]`    | image                | Hotspot on. Each has `alt` (required to publish by hand; a warning on import).    |
| `visibility`  | string list          | `shown` or `hidden`. The site only reads `shown`.                                 |
| `flags[]`     | string list          | `kids`, `reshare`, `video`. Facts about the piece, set by the pipeline, editable. |
| `subjects[]`  | string list          | What the image shows, from a fixed vocabulary.                                    |
| `themes[]`    | reference to `theme` | What the piece is about.                                                          |
| `people[]`    | string               | Accounts she tagged. Shown as credit lines linking to the account.                |
| `place`       | object               | `name`, `city`, `point`. The point is rounded to about 1 km.                      |
| `externalId`  | string               | Read only. The id of the piece in the export.                                     |

`theme`: `title`, `handle`, `description` (shown) and `note` (never shown). The ten
themes found in her text carry her own phrases as titles.

`year`: `year` (number), `intro` (one or two sentences that open the year page, hers
to write) and `note` (a summary made by the import to write the intro from; it is
never shown and only stored in the private dataset).

Default visibility on import: `hidden` when the piece shows a child (by the image
tag or by her text) or is a reshare; otherwise `shown`. A piece the tagger could
not read is treated as showing a child.

Campaigns (the tulsi series) add a `campaign` type and two fields on `post` when
that work starts. They are not built here.

## Privacy

- New work lands in a private dataset first. Only after a piece is tagged, and cleared
  by the rule below or by her, is it copied to the public dataset the site reads.
- In a public dataset anyone can list every uploaded image, so nothing hidden is ever
  uploaded there. Hiding a piece that is already public removes it from the public
  dataset.
- The site reads the public dataset at build time and needs no token.
- Raw coordinates stay on the machine that ran the pipeline. Places near home are
  dropped. What reaches Sanity is a place name and a point rounded to about 1 km.
- Direct messages in the export are never read, copied or uploaded.

## The site

Every public page is prerendered. A content change rebuilds the site.

The year pages are the spine. Within a year the unit is the month, and inside a
month the photographs run in order with a date under each.

| Route             | What it is                                                                            |
| ----------------- | ------------------------------------------------------------------------------------- |
| `/`               | The years, newest first. Each year is one photograph, the year, and its opening line. |
| `/[year]`         | The year, in order. Days are the unit: a mono date, then that day's pieces.           |
| `/theme/[handle]` | The same pieces, across years, for one theme.                                         |
| `/places`         | The world on a cork board with a pin per place, and the list of places under it.      |

The footer is a colophon: her name, the two social links, the year. No navigation
bar beyond the wordmark and the list of years.

### Composition

The site composes and she never places. Photographs take their layout from how many
are waiting:

- Two photographs: a Stagger pair. One is dropped lower, and her words sit under each.
- One photograph between pairs: a Bleed. It runs off one edge and her words sit small
  at the other side.
- Writing with no photograph: a Title page. The words carry the screen.

Pairs and singles alternate, so two Bleeds never sit together, and each layout flips
side every time it comes round. On a phone everything is one column, set in from
alternating edges.

Captions are mono, and only real: the day, and the city when the photograph carried
a place. Never a street.

### Images

- URLs come from the Sanity image builder: `auto=format` (AVIF or WebP per browser), a
  width from a fixed ladder (320 to 1920, never wider than the photograph), `fit=max`.
  Quality is 75, and 60 for the files 960 wide and up, which only dense screens use.
  Thumbnails on the home page also get 160 and 240.
- Every `<img>` has `srcset`, `sizes`, `width`, `height`, `loading="lazy"` and
  `decoding="async"`. The first image on a page loads eagerly with high priority.
- `sizes` says how wide the photograph is really drawn: its columns, or less when its
  height is capped (`sizes()` in `content/image.ts`, which mirrors the grid in
  `Blocks.svelte`). A tall story is far narrower than its columns, and a plain "40vw"
  had browsers fetch about twice the pixels.
- Pages ship no framework JavaScript (`csr = false`). The one thing that moves is a video:
  it plays, without sound or controls, while it is on screen and stops when it leaves
  (Sam, 2026-10-11). A tap, Enter or Space stops one and it stays stopped. Someone who
  asked for less motion or to save data starts each one themselves. That is the one
  inline script.
- A video is a photograph with a `video` file attached. The photograph is the still.
- Each photograph's own dominant colour (from Sanity's metadata) is the background
  until it arrives, and `width` and `height` hold its place, so nothing jumps. The
  blurred preview (LQIP) was left out: at about 1 KB each it would add 400 KB of
  markup to a full year.
- Months are drawn in full. They used to be skipped while off screen
  (`content-visibility: auto`), which saved about a third of a second of layout on a
  slow phone for the biggest year. It also made every month a guess at its own height
  until it was drawn, so a jump to a month landed in the wrong place. The page scores
  100 without it, and the row of months needs the true heights.

### The months of a year

On a year page the month names are one row (Sam, 2026-10-11). Until the first month
reaches the top of the screen only its name shows, as that month's heading. Then the row
sticks and the other names arrive one after another. Reading down, the row slides so the
next month draws nearer, slowly at first and quickest at the end, and that name arrives
in the heading's place exactly as its own section does. A name fades as it leaves the
column on either side. A click on a name goes to that month: a glide when it is near,
straight there when it is far.

- The row is a picture of the headings, for the eye and the pointer. It is hidden from
  screen readers and the keyboard, which have the headings themselves (kept in place,
  not drawn) and the list of months on the title page.
- Without the script the row is not there and the headings are drawn as usual.
- The travel is eased (the cube of how far through the month the page is). Linear is
  one character away in `app.html` if the name should leave sooner.

### Speed

Everything a visitor gets is static and comes from a CDN. Pages are HTML written at
build time and served from Vercel's edge. Photographs and videos come from Sanity's
CDN and are cached for a year. No visitor ever calls the Sanity API: the build does,
once, with `useCdn: false` so a rebuild always sees what was just changed.

- All CSS (about 20 KB) is written into each page, so nothing blocks the first paint.
  `src/hooks.server.ts` corrects the font addresses SvelteKit 3.0.1 leaves wrong in it.
- The page connects to the image CDN before the first photograph is asked for, and
  fetches the title face with the page.
- A video downloads nothing until it plays, and waits a quarter second on screen first.
- In Chrome, hovering or pressing a link gets the next page ready (speculation rules).
- Lighthouse, phone and desktop, on home, two years, a theme and places: 100 in all
  four categories is the bar. AGENTS.md says how to measure.

### Map

A pin board, drawn as one SVG at build time. The whole world is always in view
(Natural Earth projection fitted to the sphere, never to the pins). The continents
are a paper cut-out on a grey board with a cork grain, with one black pin per place,
sized by how many pieces were made there. City names in mono beside the larger
clusters. No tiles and no script in the browser. The board stays inside the page's
palette: the texture is grain, not colour.

## Hiding and showing (edit mode)

Phase two, its own change. A page behind a passphrase shows a year with every
piece on it, hidden ones dimmed. One tap flips a piece between shown and hidden.
The write happens on the server with a token. Until then she can flip
`visibility` in Sanity Studio.

## Testing

- Unit: the composition rule (which layout a day gets, side flipping), the image
  URL ladder, the catalog's visibility rule.
- End to end: the home page lists years, a year page renders and has no image
  without alt text, a hidden piece does not appear.
- Gates stay as they are: check, lint, test, build, and accessibility at 100.

## Not in this change

Video, the campaign pages, the creator app, edit mode, search, comments, email.

## Open questions

1. Reshares are hidden by default. Should they be left out of the site entirely?
2. Tagged businesses: credit lines only, or also a page per business?
3. The old `/thoughts/*` addresses pointed at three posts that are gone. Redirect
   them to `/` or let them 404?
