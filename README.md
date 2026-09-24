# Lighthouse

A tiny text adventure with four rooms, illustrated scenes, a location map, and gentle room transitions. Start on the Rocks and use the arrow keys or direction buttons to explore.

Open `outputs/index.html` in a browser to play. The compiled JavaScript and illustrations are included, so no server is required.

To rebuild the TypeScript:

```sh
cd outputs
npm install
npm run build
```

The page uses plain HTML and CSS, with game logic in TypeScript. Generated illustration prompts are in `outputs/images/prompts.md`.

Keep this a small prototype with no framework, as a reference for the proper app.
