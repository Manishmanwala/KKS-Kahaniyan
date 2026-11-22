// app-state.js
// एक ही जगह से पूरा कंट्रोल + ऐप की सेटिंग (localStorage) से बिना कोड बदले बदलाव

const SETTINGS_STORAGE_KEY = "kks_runtime_settings_v1";

// यहाँ से आप मुख्य कंट्रोल/नंबर बदल सकते हैं (पूरे सिस्टम का आधार)
export const SITE_CONTROLS = {
  mode: 1, // 1 = सामान्य कहानी मंच, 2 = कम्युनिटी/कंट्रोल मोड आदि
  wordsPerMinute: 150,
  maxCommentLength: 500,
  showFeed: true,
  showSubmit: true,
  showHeaderNav: true,
  themePreset: "warm"
};

const state = {
  currentUser: null,
  activeView: "feed",
  activeCategory: "सभी",
  searchQuery: "",
  stories: [],
  controls: { ...SITE_CONTROLS }
};

// ऐप की सेटिंग से सेव किए गए बदलाव उठाना (बिना कोड बदले)
function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && typeof saved === "object") {
      Object.assign(state.controls, saved);
    }
  } catch (_) {}
}

loadSavedSettings();

const listeners = new Set();

export function getState() {
  return {
    ...state,
    controls: { ...state.controls }
  };
}

export function setState(patch = {}) {
  if (patch.controls && typeof patch.controls === "object") {
    state.controls = { ...state.controls, ...patch.controls };
  }
  const { controls, ...rest } = patch;
  Object.assign(state, rest);
  notify();
}

// ऐप की सेटिंग से थोड़ा-बहुत बदलाव सेव करने के लिए (बिना कोड बदले)
export function updateAppSetting(key, value) {
  if (!key || !(key in SITE_CONTROLS)) return getState().controls;
  state.controls[key] = value;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.controls));
  } catch (_) {}
  notify();
  return { ...state.controls };
}

// सेटिंग्स को वापस कोड वाले SITE_CONTROLS पर लाने के लिए
export function resetAppSettings() {
  state.controls = { ...SITE_CONTROLS };
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (_) {}
  notify();
  return { ...state.controls };
}

export function subscribeState(listener) {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  const snapshot = getState();
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (_) {}
  });
}
