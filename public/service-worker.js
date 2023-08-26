self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('my-pwa-cache').then(cache => {
        return cache.addAll([
          '/',
          //'/global.css',
          '/playlist',
          '/songs',
          //'/index',
          'manifest.json',
          'icons/favicon-16x16.png',
          'icons/favicon-32x32.png',
          'icon-192x192.png',
          'favicon.ico'
        ]);
      })
    );
  });
  
/*  self.addEventListener('fetch', event => {  //In modalità online crea effetto loop
    event.respondWith(
      caches.match(event.request).then(response => {
        console.log(event.request)
        return response || fetch(event.request);
      })
    );
  }); */
  