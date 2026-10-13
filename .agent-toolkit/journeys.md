# UX journeys (/drive)

Run against `pnpm build && pnpm preview` (every route is prerendered from Sanity).

## home

- go to /
- expect heading level 1 "d-ana"
- expect a list of years, newest first, each a link
- expect every image loaded (no broken images)

## read a year

- go to /
- click the first year
- expect URL /<year>
- expect heading level 1 with the year
- expect at least one photograph, and every photograph has a description
- click the first month link
- expect the URL to end with #<year>-<month>

## places

- go to /places
- expect heading level 1 "Places"

## keyboard

- go to /
- press Tab
- expect focus on "Skip to content"
- press Enter
- expect focus inside main

## not found

- go to /thoughts/anything
- expect status 404
