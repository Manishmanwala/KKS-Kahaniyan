// router.js
// व्यू/सेक्शन बदलने वाला सिस्टम — app-state.js के साथ मिलकर activeView संभालता है

import { getState, setState } from "./app-state.js";

const viewHandlers = new Map();

export function registerRoute(viewName, handler) {
  if (!viewName || typeof handler !== "function") return;
  viewHandlers.set(viewName, handler);
}

export async function navigateTo(viewName, payload = {}) {
  if (!viewName) return;

  setState({
    activeView: viewName,
    activePayload: payload
  });

  const handler = viewHandlers.get(viewName);
  if (typeof handler === "function") {
    await handler(payload, getState());
  }
}

export function getCurrentRoute() {
  const { activeView, activePayload } = getState();
  return { view: activeView, payload: activePayload || {} };
}
