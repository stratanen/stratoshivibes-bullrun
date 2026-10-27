// Offline support: keeps a copy of the game on the device after the first online launch.
// Pages load network-first (players get updates when online), everything else comes from the cache.
// Raise the number in CACHE every time you change a file, so phones pick up the change.
const CACHE = 'sv-bullrun-v2';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './privacy.html',
  './terms.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './wallet.bundle.js',
  './fonts/commissioner-greek-400-normal.woff2',
  './fonts/commissioner-greek-600-normal.woff2',
  './fonts/commissioner-greek-800-normal.woff2',
  './fonts/commissioner-latin-400-normal.woff2',
  './fonts/commissioner-latin-600-normal.woff2',
  './fonts/commissioner-latin-800-normal.woff2',
  './fonts/saira-latin-600-italic.woff2',
  './fonts/saira-latin-800-italic.woff2',
  './fonts/saira-latin-900-italic.woff2',
  './vendor/three/examples/jsm/postprocessing/EffectComposer.js',
  './vendor/three/examples/jsm/postprocessing/MaskPass.js',
  './vendor/three/examples/jsm/postprocessing/OutputPass.js',
  './vendor/three/examples/jsm/postprocessing/Pass.js',
  './vendor/three/examples/jsm/postprocessing/RenderPass.js',
  './vendor/three/examples/jsm/postprocessing/ShaderPass.js',
  './vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js',
  './vendor/three/examples/jsm/environments/RoomEnvironment.js',
  './vendor/three/examples/jsm/shaders/CopyShader.js',
  './vendor/three/examples/jsm/shaders/LuminosityHighPassShader.js',
  './vendor/three/examples/jsm/shaders/OutputShader.js',
  './vendor/three/examples/jsm/utils/BufferGeometryUtils.js',
  './vendor/three/build/three.module.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  if (isPage) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
