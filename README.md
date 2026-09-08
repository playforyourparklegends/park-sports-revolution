# Legends of the Park

Use the legends-player-card-carousel skill (which references the immersive-3d-carousel skill) to build a single mobile screen — this is the very first, isolated build, so build only this screen and nothing else (no routing, no nav, no other pages).

Follow the skill exactly, including its "Placeholder-content mode" and page-layout sections:
- Pitch-black (#000000) stage and pitch-black card interiors, dark-gold (#D4AF37) card edges only.
- No title, header, or any text/logo above the carousel — the carousel is the very first thing on screen, just clearing the safe-area/notch.
- Cards are compact (~46% viewport width per the skill's card geometry table), not large hero-sized cards.
- Below the carousel: nothing but blank pitch-black background, full remaining screen height.
- 5 cards, no real player data, no names/positions/numbers/photos anywhere — pure placeholder-content mode per the skill (pitch-black face, gold edge, subtle gold monogram/sheen only).
- Full continuous-depth swipe physics, gold gloss tracking, and the front-card vertical flip-to-reveal gesture, exactly as specified in the skill (front card can flip to a second blank pitch-black face for now since there's no real day-job photo yet).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://park-sports-revolution.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/77a141e1-60b7-40fd-8806-029689c4a840).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
