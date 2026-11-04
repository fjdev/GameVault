# Game Vault

A mobile-first, installable collection of **Mastermind**, **Othello**, and **Battleship**. The title screen shows an endless torchlit dungeon corridor in a deliberately limited 2D game style. Press Start opens the game selection panel over the same scene.

## Publish with GitHub Pages

1. Extract this ZIP. Upload the **contents of the `game-vault` folder** to the root of a GitHub repository. `index.html`, `.nojekyll`, `games/`, and `assets/` should be at the repository root, not inside another folder.
2. In the repository, open **Settings → Pages**. Set **Build and deployment** to **Deploy from a branch**, select your main branch and **`/ (root)`**, then save.
3. Open the HTTPS URL GitHub Pages provides. On a phone, use the browser's **Add to Home Screen / Install** action to install the app.

You can also publish the files on any static HTTPS host. There is no build step, backend, account, or external CDN dependency. Relative paths support both a repository subpath and a custom domain.

## Run locally

From the extracted `game-vault` directory:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Opening `index.html` directly via `file://` will not run the module or service worker correctly.

## Controls and features

- Tap **Press Start**, or press Enter/Space. Select a game by tap or with arrow keys and Enter. Escape returns to the title screen.
- Pause or resume the corridor with the on-screen control. A reduced-motion preference starts it paused.
- All three games support solo and local two-player play. Solo play has Easy, Normal, Hard, and Expert difficulty. Games save their state in local browser storage.
- Mastermind uses a physical peg board, Othello a green board with black and ivory discs, and Battleship a two-board blue plastic console with miniature ships.
- All interface text is English. The site is offline-ready after the first successful load through its service worker.

## Tests

Node.js 18 or newer:

```bash
npm test
```

The test suite checks game engines, game flows, and title/menu interaction. Visual behavior should also be checked on the target phone after GitHub Pages deploys; the CSS adapts to narrow screens.

## Project structure

- `index.html`, `vault.css`, `vault.js`, `dungeon.js`: title screen, menu, and corridor loop.
- `assets/`: bundled artwork, font, and PWA icons.
- `games/mastermind/`, `games/othello/`, `games/battleship/`: the independent games and their engines.
- `games/physical.css` and `games/retro.css`: common game presentation.
- `manifest.webmanifest`, `sw.js`: install and offline support.
- `tests/`: automated checks.
