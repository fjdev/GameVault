const CACHE='game-vault-v7.0.0';
const FILES=['./','./index.html','./vault.css','./vault.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png',
'./dungeon.js','./assets/fonts/vault-pixel.ttf','./assets/art/game-vault-logo-pixel.png','./assets/art/corridor-plate.png','./assets/art/corridor-arch-v7.png','./assets/art/othello-board-v7.png','./assets/art/battleship-console-v7.png','./assets/art/battleship-miniature-v7.png','./assets/art/mastermind-board-v7.png','./games/physical.css','./games/retro.css',
'./games/mastermind/','./games/mastermind/index.html','./games/mastermind/styles.css','./games/mastermind/physical.css','./games/mastermind/retro.css','./games/mastermind/app.js','./games/mastermind/engine.js',
'./games/othello/','./games/othello/index.html','./games/othello/style.css','./games/othello/physical.css','./games/othello/retro.css','./games/othello/app.js','./games/othello/engine.js',
'./games/battleship/','./games/battleship/index.html','./games/battleship/style.css','./games/battleship/physical.css','./games/battleship/retro.css','./games/battleship/app.js','./games/battleship/engine.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('game-vault-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r})))})
