const EVENT_NAME = "auth:changed";

export function emitAuthChanged() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function onAuthChanged(cb: () => void) {
  window.addEventListener(EVENT_NAME, cb);
  return () => window.removeEventListener(EVENT_NAME, cb);
}
