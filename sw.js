const CACHE = "efata-secure-briefing-v1-1";
const PUBLIC_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/patroai-192.png", "/icons/patroai-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if(req.method !== "GET" || url.origin !== self.location.origin) return;
  if(url.pathname.startsWith("/api") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/briefing") || url.pathname.startsWith("/a/")) return;
  event.respondWith(
    fetch(req, {cache:"no-store"}).catch(()=>caches.match(req).then(r=>r || caches.match("/index.html")))
  );
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.title || "Efatá";
  const options = {
    body: data.body || "Nova atualização disponível.",
    icon: "/icons/patroai-192.png",
    badge: "/icons/patroai-192.png",
    data: {url: data.url || "/admin"},
    tag: "efata-access-request",
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = event.notification.data?.url || "/admin";
  event.waitUntil(
    self.clients.matchAll({type:"window", includeUncontrolled:true}).then(clients => {
      for(const client of clients){
        if("focus" in client){
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
