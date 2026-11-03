# Game Vault V4

Painted treasury home screen, based on the approved vaulted room concept. All game menus, instructions, feedback and accessibility labels are in English.

## Run

Serve this directory with `python3 -m http.server 8000`, then open http://localhost:8000. Run `npm test` with Node 18 or newer.

## Preserved

Mastermind, Othello and Battleship rules; Easy, Normal, Hard and Expert; solo and local two-player modes; existing storage keys; game menus and resume; variable computer delays; hit, miss and sunk feedback.

## Changes

The home screen uses the approved painted room with three accessible chest links. The full illustration stays visible at every screen ratio, with dark margins when needed. English title sizing was adjusted for Mastermind. Service-worker caches were versioned; the legacy Mastermind worker now deletes only its own old caches.

The interiors retain their V3.1 visual treatment. This release does not claim completion of the planned physical-board redesign.

## GitHub Pages

Upload the extracted contents to the repository root and enable Pages from that branch/root. Relative links support repository subpaths. Open the deployed HTTPS URL to install the PWA. No account or backend is required.

Device installation, offline operation and upgrades still need testing on real iOS/Android devices. This archive has not been published.
