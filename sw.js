// Keeps the hub's page and libraries cached so it opens without signal.
// Trip data itself is cached by the page (last copy you saw), not here.
const CACHE = "euro27-v2";
const SHELL = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("supabase.co")) return;              // never cache live data or files
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/config.js");
  if (isPage) {                                                    // network first: always get the latest version
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {       // cache first for libraries, fonts, icons
    if (r.ok && (url.origin === location.origin || /cdnjs|jsdelivr|fonts\.(googleapis|gstatic)/.test(url.hostname))) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
    return r; })));
});

// Push notifications: someone added a stop to the map.
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Euro Summer '27", {
    body: d.body || "Something new in the hub", tag: d.tag, renotify: !!d.tag,
    icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "./" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (c.url.startsWith(self.registration.scope)) { c.postMessage({ go: "map" }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
