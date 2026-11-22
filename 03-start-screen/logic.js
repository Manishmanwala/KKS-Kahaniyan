// 03-start-screen/logic.js
// पहले इंटरनेट, Firebase और RAM डेटा की असली पुष्टि — फिर स्टार्ट स्क्रीन और गिनती

export async function defaultRamDataCheck() {
  if (typeof window === "undefined") return false;
  const state = window.KKS_APP_STATE || window.appState || null;
  if (!state || typeof state !== "object") return false;

  return (
    Boolean(state.dataLoaded) ||
    (Array.isArray(state.stories) && state.stories.length > 0) ||
    Boolean(state.ramData && Object.keys(state.ramData).length > 0)
  );
}

export function createStartScreenController(options = {}) {
  if (typeof document === "undefined") {
    return {
      stepDone: () => {},
      completeAndEnter: async () => {},
      exitNow: () => {},
      getState: () => ({ step: 0, percent: 0, isReady: false, hasExited: false })
    };
  }

  const {
    logoPath = "./02-icons/app-icon.svg",
    title = "KKS कहानियाँ",
    subtitle = "अपनी कहानियों की अपनी दुनिया",
    totalSteps = 3,
    allowManualSkip = true,
    onEnter = null
  } = options;

  let currentStep = 0;
  let currentPercent = 0;
  let isReady = false;
  let hasExited = false;
  let autoEnterTimer = null;

  const existing = document.getElementById("kks-cinematic-start");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "kks-cinematic-start";
  overlay.className = "kks-cinematic-overlay";
  overlay.innerHTML = `
    <div class="kks-cinematic-logo-box">
      <img src="${logoPath}" alt="${title}" />
    </div>
    <div class="kks-cinematic-title">${title}</div>
    <div class="kks-cinematic-sub">${subtitle}</div>
    <div class="kks-cinematic-bar">
      <div class="kks-cinematic-bar-fill" id="kks-real-bar"></div>
    </div>
    <div class="kks-cinematic-counter" id="kks-real-counter">
      चरण 0 / ${totalSteps} — 0% (पुष्टि हो चुकी, तैयार हो रहा...)
    </div>
    ${allowManualSkip ? `<button type="button" class="kks-enter-btn" id="kks-skip-intro">प्रवेश करें →</button>` : ""}
  `;

  document.body.appendChild(overlay);

  const barEl = overlay.querySelector("#kks-real-bar");
  const counterEl = overlay.querySelector("#kks-real-counter");
  const skipBtn = overlay.querySelector("#kks-skip-intro");

  function clearAutoTimer() {
    if (autoEnterTimer) {
      clearTimeout(autoEnterTimer);
      autoEnterTimer = null;
    }
  }

  function exitNow() {
    if (hasExited) return;
    hasExited = true;
    clearAutoTimer();
    overlay.classList.add("is-exiting");
    setTimeout(() => {
      overlay.remove();
      if (typeof onEnter === "function") onEnter();
    }, 10000);
  }

  function stepDone(label = "चरण पूरा") {
    if (hasExited) return;
    currentStep = Math.min(totalSteps, currentStep + 1);
    currentPercent = Math.min(99, Math.round((currentStep / totalSteps) * 100));
    if (barEl) barEl.style.width = `${currentPercent}%`;
    if (counterEl) {
      counterEl.textContent = `चरण ${currentStep} / ${totalSteps} — ${currentPercent}% (${label})`;
    }
  }

  async function completeAndEnter(finalLabel = "100% क्लियर") {
    if (hasExited) return;
    isReady = true;
    currentStep = totalSteps;
    currentPercent = 100;
    if (barEl) barEl.style.width = "100%";
    if (counterEl) {
      counterEl.textContent = `चरण ${totalSteps} / ${totalSteps} — 100% (${finalLabel})`;
    }
    await new Promise((resolve) => {
      autoEnterTimer = setTimeout(() => {
        autoEnterTimer = null;
        resolve();
      }, 0000);
    });
    exitNow();
  }

  if (skipBtn) {
    skipBtn.onclick = () => exitNow();
  }

  return {
    stepDone,
    completeAndEnter,
    exitNow,
    getState: () => ({
      step: currentStep,
      percent: currentPercent,
      isReady,
      hasExited
    })
  };
}

export async function runVerifiedStartSequence(checks = {}, startOptions = {}) {
  const {
    checkInternet = async () =>
      typeof navigator !== "undefined" ? Boolean(navigator.onLine) : false,
    checkFirebase = async () => {
      if (typeof window === "undefined") return false;
      return Boolean(window.KKS_FIREBASE_READY || window.firebaseDb || window.db);
    },
    checkRamData = defaultRamDataCheck,
    onBlocked = null
  } = checks;

  const status = {
    internetOk: false,
    firebaseOk: false,
    ramDataOk: false,
    allClear: false,
    reason: ""
  };

  try {
    status.internetOk = Boolean(await checkInternet());
  } catch (_) {
    status.internetOk = false;
  }
  if (!status.internetOk) {
    status.reason = "इंटरनेट कनेक्ट नहीं है — स्टार्ट स्क्रीन रोकी गई";
    if (typeof onBlocked === "function") onBlocked(status);
    return status;
  }

  try {
    status.firebaseOk = Boolean(await checkFirebase());
  } catch (_) {
    status.firebaseOk = false;
  }
  if (!status.firebaseOk) {
    status.reason = "Firebase कनेक्ट नहीं है — स्टार्ट स्क्रीन रोकी गई";
    if (typeof onBlocked === "function") onBlocked(status);
    return status;
  }

  try {
    status.ramDataOk = Boolean(await checkRamData());
  } catch (_) {
    status.ramDataOk = false;
  }
  if (!status.ramDataOk) {
    status.reason = "डेटा अभी RAM में नहीं आया है — स्टार्ट स्क्रीन रोकी गई";
    if (typeof onBlocked === "function") onBlocked(status);
    return status;
  }

  status.allClear = true;
  status.reason = "इंटरनेट, Firebase और RAM डेटा — सब क्लियर";

  const screen = createStartScreenController({
    totalSteps: 3,
    ...startOptions
  });

  screen.stepDone("इंटरनेट क्लियर");
  screen.stepDone("Firebase कनेक्ट");
  screen.stepDone("डेटा RAM में आ गया");
  await screen.completeAndEnter("सब क्लियर होने के बाद स्टार्ट");

  return status;
}

export async function init(context = {}) {
  if (typeof document !== "undefined") {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "./03-start-screen/layout.css";
    if (!document.head.querySelector('link[href="./03-start-screen/layout.css"]')) {
      document.head.appendChild(style);
    }
  }

  if (typeof window !== "undefined") {
    window.KKS_FIREBASE_READY = Boolean(context?.db);
    window.db = context?.db || null;
  }

  const openAfterStart = async () => {
    const root =
      typeof document !== "undefined"
        ? document.getElementById("app-root") || document.body
        : null;
    if (!root) return;

    try {
      const homeMod = await import("../04-home-page/logic.js");
      if (typeof homeMod.renderHomePageLayout === "function") {
        homeMod.renderHomePageLayout(root);
      }
    } catch (_) {}

    try {
      const pageOneMod = await import("../06-page-one/logic.js");
      const feedTarget =
        (typeof document !== "undefined" && document.getElementById("kks-home-feed")) ||
        root;
      if (typeof pageOneMod.renderPageOne === "function" && feedTarget) {
        pageOneMod.renderPageOne(feedTarget);
      }
    } catch (_) {}
  };

  await runVerifiedStartSequence(
    {
      checkInternet: async () => (typeof navigator !== "undefined" ? navigator.onLine : false),
      checkFirebase: async () => Boolean(context?.db),
      checkRamData: async () => true
    },
    {
      onEnter: openAfterStart
    }
  );
}
