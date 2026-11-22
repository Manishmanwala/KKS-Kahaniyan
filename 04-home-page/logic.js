// 04-home-page/logic.js - चौथा फ़ोल्डर: बेसिक लेआउट रेंडर और एरर बटन से 05-error-alert कॉल

export const NEXT_ERROR_FOLDER = "./05-error-alert";

export async function callFifthErrorFolder(errorPayload = {}) {
  const targetFolder = NEXT_ERROR_FOLDER;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kks:call-folder", {
        detail: { folder: targetFolder, source: "04-home-page", payload: errorPayload }
      })
    );
  }
  try {
    return await import(`${targetFolder}/logic.js`);
  } catch (_) {
    return { calledFolder: targetFolder, exists: false };
  }
}

export function renderHomePageLayout(container, handlers = {}) {
  if (!container) return;

  container.innerHTML = `
    <div class="kks-home-shell">
      <div>
        <header class="kks-home-header">
          <div class="kks-brand-group">
            <span class="kks-red-box">KKS</span>
            <span class="kks-brand-text">कहानियाँ</span>
          </div>
          <div class="kks-top-icons">
            <button type="button" class="kks-top-btn" id="kks-btn-search" aria-label="सर्च">🔍</button>
            <button type="button" class="kks-top-btn" id="kks-btn-bell" aria-label="बेल">🔔</button>
            <button type="button" class="kks-top-btn kks-top-err-btn" id="kks-btn-error" aria-label="एरर">!</button>
          </div>
        </header>

        <div class="kks-tabs-strip">
          <button type="button" class="kks-tab-chip is-active">सभी</button>
          <button type="button" class="kks-tab-chip">खास क्षेत्र</button>
          <button type="button" class="kks-tab-chip">नई कहानियाँ</button>
        </div>

        <main class="kks-home-feed" id="kks-home-feed">
          <div class="kks-basic-card">
            <div style="font-weight:700;margin-bottom:4px;">बेसिक लेआउट तैयार</div>
            <div style="font-size:13px;color:#a1a1aa;">04-home-page का शुरुआती ढांचा जुड़ा है।</div>
          </div>
        </main>
      </div>

      <nav class="kks-bottom-nav" aria-label="मुख्य नेविगेशन">
        <button type="button" class="kks-nav-item" id="kks-nav-1"><span>🏠</span><span>होम</span></button>
        <button type="button" class="kks-nav-item" id="kks-nav-2"><span>📖</span><span>पढ़ें</span></button>
        <button type="button" class="kks-nav-item" id="kks-nav-plus"><span class="kks-nav-plus">+</span></button>
        <button type="button" class="kks-nav-item" id="kks-nav-4"><span>⭐</span><span>खास</span></button>
        <button type="button" class="kks-nav-item" id="kks-nav-5"><span>👤</span><span>मेरा</span></button>
      </nav>
    </div>
  `;

  const errBtn = container.querySelector("#kks-btn-error");
  if (errBtn) {
    errBtn.onclick = () => {
      callFifthErrorFolder({ from: "home-top-error-icon" });
    };
  }

  if (typeof handlers.onSearch === "function") {
    const sBtn = container.querySelector("#kks-btn-search");
    if (sBtn) sBtn.onclick = handlers.onSearch;
  }
  if (typeof handlers.onBell === "function") {
    const bBtn = container.querySelector("#kks-btn-bell");
    if (bBtn) bBtn.onclick = handlers.onBell;
  }
}
