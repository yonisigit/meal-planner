type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export function setAccessToken(token: string | null) {
  accessToken = token ?? null;
  listeners.forEach((listener) => listener(accessToken));
}

export function getAccessToken() {
  return accessToken;
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
