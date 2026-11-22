// app-state.js
// पूरे ऐप की साझा स्थिति (State) — ताकि अलग-अलग मॉड्यूल्स एक ही जानकारी से तालमेल रख सकें

const state = {
  currentUser: null,
  activeView: "feed",
  activeCategory: "सभी",
  searchQuery: "",
  stories: []
};

const listeners = new Set();

export function getState() {
  return { ...state };
}

export function setState(patch = {}) {
  Object.assign(state, patch);
  listeners.forEach((fn) => {
    try {
      fn(getState());
    } catch (_) {}
  });
}

export function subscribeState(listener) {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}
