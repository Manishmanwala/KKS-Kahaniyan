// 05-error-alert/logic.js - 100% एक्ज़ीक्यूशन जाँच और Live Health अलर्ट पैनल

const EXPECTED_FOLDERS = [
  "01-core-config",
  "02-icons",
  "03-start-screen",
  "04-home-page",
  "05-error-alert"
];

export function recordModuleExecution(folderName, status = "passed", detail = "") {
  if (typeof window === "undefined") return;
  window.KKS_MODULE_STATUS = window.KKS_MODULE_STATUS || {};
  window.KKS_MODULE_STATUS[folderName] = {
    status, // "passed" | "failed" | "pending"
    detail,
    time: new Date().toLocaleTimeString("en-GB")
  };
}

export function checkFullSystemExecution(expectedList = EXPECTED_FOLDERS) {
  const registry =
    typeof window !== "undefined" && window.KKS_MODULE_STATUS
      ? window.KKS_MODULE_STATUS
      : {};

  const passed = [];
  const failed = [];
  const pending = [];

  for (const folder of expectedList) {
    const entry = registry[folder];
    if (!entry) {
      pending.push(`${folder} (अभी रिपोर्ट नहीं आई / पेंडिंग)`);
      continue;
    }
    if (entry.status === "passed") {
      passed.push(`${folder} (${entry.time || "ok"})`);
    } else if (entry.status === "failed") {
      failed.push(`${folder} — ${entry.detail || "एक्ज़ीक्यूट नहीं हो पाया"}`);
    } else {
      pending.push(`${folder} — ${entry.detail || "प्रतीक्षारत"}`);
    }
  }

  const total = expectedList.length;
  const is100Percent =
    total > 0 &&
    passed.length === total &&
    failed.length === 0 &&
    pending.length === 0;

  return {
    total,
    passed,
    failed,
    pending,
    is100Percent
  };
}

export function openErrorAlertPanel(expectedList = EXPECTED_FOLDERS) {
  if (typeof document === "undefined") return null;

  const report = checkFullSystemExecution(expectedList);
  const statusBanner = report.is100Percent
    ? `100% एक्ज़ीक्यूट (${report.passed.length}/${report.total} मॉड्यूल सफल)`
    : `0.1% या अधिक कमी मौजूद: 100% पूरा नहीं (${report.passed.length}/${report.total} सफल, ${report.failed.length} फेल, ${report.pending.length} पेंडिंग)`;

  const renderLines = (items, emptyMsg) =>
    items.length
      ? items.map((t) => `<div class="kks-alert-line">• ${t}</div>`).join("")
      : `<div class="kks-alert-line">• ${emptyMsg}</div>`;

  let backdrop = document.getElementById("kks-05-error-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "kks-05-error-backdrop";
    backdrop.className = "kks-alert-backdrop";
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="kks-alert-sheet" role="dialog" aria-label="Website Running Status">
      <div class="kks-alert-top">
        <div>
          <div class="kks-alert-title">Website Running Status (Live Health)</div>
          <div class="kks-alert-summary">${statusBanner}</div>
        </div>
        <button type="button" class="kks-alert-close" id="kks-close-alert-sheet">बंद करें</button>
      </div>

      <div class="kks-alert-group kks-alert-ok">
        <div class="kks-alert-heading" style="color:#4ade80;">सफलतापूर्वक रन हुए (${report.passed.length})</div>
        ${renderLines(report.passed, "कोई फ़ोल्डर रन नहीं हुआ")}
      </div>

      <div class="kks-alert-group kks-alert-fail">
        <div class="kks-alert-heading" style="color:#f87171;">रन होने में फेल हुए (${report.failed.length})</div>
        ${renderLines(report.failed, "कोई फेल/एरर नहीं")}
      </div>

      <div class="kks-alert-group kks-alert-pending">
        <div class="kks-alert-heading" style="color:#facc15;">प्रतीक्षारत / पेंडिंग (${report.pending.length})</div>
        ${renderLines(report.pending, "कोई पेंडिंग नहीं")}
      </div>
    </div>
  `;

  backdrop.classList.add("is-open");

  const closeBtn = backdrop.querySelector("#kks-close-alert-sheet");
  if (closeBtn) {
    closeBtn.onclick = () => backdrop.classList.remove("is-open");
  }
  backdrop.onclick = (e) => {
    if (e.target === backdrop) backdrop.classList.remove("is-open");
  };

  return report;
}

// जब 04-home-page या कोई भी जगह kks:call-folder से 05-error-alert को बुलाए
if (typeof window !== "undefined") {
  window.addEventListener("kks:call-folder", (ev) => {
    if (ev?.detail?.folder === "./05-error-alert") {
      openErrorAlertPanel();
    }
  });
}
