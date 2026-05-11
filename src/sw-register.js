const UPDATE_CHECK_INTERVAL = 60 * 1000;

let updateCallback = null;

export function onUpdateReady(cb) {
  updateCallback = cb;
}

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  const hadController = !!navigator.serviceWorker.controller;

  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      setInterval(() => {
        registration.update().catch(() => {});
      }, UPDATE_CHECK_INTERVAL);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    })
    .catch(() => {});

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    if (refreshing) return;
    refreshing = true;
    if (updateCallback) {
      updateCallback();
    } else {
      window.location.reload();
    }
  });
}
