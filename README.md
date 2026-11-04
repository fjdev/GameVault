# Game Vault V5 — Endless Dungeon

The home screen is now a low-resolution first-person dungeon corridor with ordered dithering, repeating paired torches and an endless forward walk. The background is rendered locally in Canvas; it is not a downloaded video and needs no network connection after installation.

## Menu

- Press Start with a tap, Enter or Space.
- Select Mastermind, Othello or Battleship with a tap or keyboard.
- Arrow keys change selection; Enter opens the selected game; Escape returns to the title.
- Pause / Play stops and resumes the corridor. Reduced-motion settings start it paused.
- The background remains visible behind both screens.

The custom Game Vault title takes its lettering direction from vintage fantasy RPG covers. Menu options use an original bundled bitmap alphabet; no external font request is needed.

## Run

Serve the extracted directory with `python3 -m http.server 8000`, then open http://localhost:8000. Run `npm test` with Node 18+.

`dungeon-loop-preview.gif` shows the background animation, exported from the same renderer. It is only a preview: the app draws the animation live and never loads that GIF.

## Preserved / pending

All three existing game engines, four difficulty levels, solo/local modes, storage keys, game menus, resume behavior and computer-turn delays are preserved. The approved physical-board redesign is still pending; it has not been included in this menu-focused release. Existing game screens retain V3.1 layouts with English text.

19 automated tests pass. The rendered loop boundary was also checked byte-for-byte at 0 and 16 seconds. Browser/device visual QA, installation, offline upgrades and performance on real phones remain unverified. This release has not been published.

## GitHub Pages

Upload the extracted files to the repository root and enable Pages from that branch/root. Relative paths work under a repository subdirectory. Installation requires the deployed HTTPS URL. Service-worker assets and cache version were updated for this release.
