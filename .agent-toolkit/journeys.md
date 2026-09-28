# UX journeys (/drive)

Run against `pnpm build && pnpm preview` (every route is prerendered from Sanity).

## home

- go to /
- expect heading level 1 containing "I'm"
- expect heading "Thoughts"
- expect every image loaded (no broken images)
- click the hero video's "Pause video" button
- expect the video paused and the button named "Play video"
- click "Play video"
- expect the video playing

## read a thought

- go to /
- click the first "read more" link
- expect URL /thoughts/<slug>
- expect heading level 1 with the post title
- expect the hero image fully below the fixed header

## keyboard

- go to /
- press Tab
- expect focus on "Skip to content"
- press Enter
- expect focus inside main

## unknown thought

- go to /thoughts/does-not-exist
- expect status 404 and a page title starting "404"

## mobile

- at 375px wide, go to / and a thought
- expect no horizontal scroll
