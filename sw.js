var CACHE = "bt-v1";

self.addEventListener("install", function (e) {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches
      .keys()
      .then(function (ks) {
        return Promise.all(
          ks
            .filter(function (k) {
              return k !== CACHE;
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;

  if (r.mode === "navigate") {
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return fetch(r)
          .then(function (res) {
            try {
              c.put("index.html", res.clone());
            } catch (_) {}
            return res;
          })
          .catch(function () {
            return c.match("index.html");
          });
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(r).then(function (cached) {
        var net = fetch(r)
          .then(function (res) {
            try {
              c.put(r, res.clone());
            } catch (_) {}
            return res;
          })
          .catch(function () {
            return cached;
          });
        return cached || net;
      });
    })
  );
});
