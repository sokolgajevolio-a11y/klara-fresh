const store = {
  IMAGE_FIX_STRATEGY: null // "STOCK" | "AI"
};

export function setPreference(key, value) {
  store[key] = value;
}

export function getPreference(key) {
  return store[key];
}

export function clearPreference(key) {
  store[key] = null;
}
