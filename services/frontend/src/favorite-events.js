const EVENT = "favorites:changed";

export function emitFavoriteChange(payload) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: payload }));
}

export function onFavoriteChange(handler) {
  function listener(e) { handler(e.detail); }
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
