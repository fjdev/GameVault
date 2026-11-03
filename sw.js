const CACHE='game-vault-v3.0.0';
const FILES=['./','./index.html','./vault.css','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png',
'./assets/art/vault-painting.jpg','./assets/art/paper-grain.png','./assets/art/chest-amber-ink.webp','./assets/art/chest-amber-open-ink.webp','./assets/art/chest-emerald-ink.webp','./assets/art/chest-emerald-open-ink.webp','./assets/art/chest-sapphire-ink.webp','./assets/art/chest-sapphire-open-ink.webp',
'./games/mastermind/','./games/mastermind/index.html','./games/mastermind/styles.css','./games/mastermind/app.js','./games/mastermind/engine.js',
'./games/othello/','./games/othello/index.html','./games/othello/style.css','./games/othello/app.js','./games/othello/engine.js',
'./games/battleship/','./games/battleship/index.html','./games/battleship/style.css','./games/battleship/app.js','./games/battleship/engine.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('game-vault-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r})))})
