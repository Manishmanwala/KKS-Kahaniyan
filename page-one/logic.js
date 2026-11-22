// page-one/logic.js - पहला पेज: कंटेंट/कहानी दिखाने का लॉजिक

export function getFirstPageData(overrideData = null) {
  if (overrideData && typeof overrideData === "object") {
    return overrideData;
  }

  const state =
    typeof window !== "undefined"
      ? window.KKS_APP_STATE || window.appState || null
      : null;

  const firstStory =
    state && Array.isArray(state.stories) && state.stories.length > 0
      ? state.stories[0]
      : null;

  return {
    category: firstStory?.category || "पहला पेज",
    title: firstStory?.title || "KKS कहानियाँ — पहला पन्ना",
    author: firstStory?.author || "मनीष कश्यप",
    paragraphs: Array.isArray(firstStory?.paragraphs) && firstStory.paragraphs.length > 0
      ? firstStory.paragraphs
      : [
          "यहाँ से आपकी कहानी का पहला पन्ना खुलेगा।",
          "जैसे ही डेटा लोड होगा, यहाँ असली कहानी पढ़ने के लिए तैयार मिलेगी।"
        ]
  };
}

export function renderPageOne(container, storyData = null) {
  if (!container) return null;

  const data = getFirstPageData(storyData);
  const bodyHtml = data.paragraphs
    .map((line) => `<p>${line}</p>`)
    .join("");

  container.innerHTML = `
    <div class="kks-page-one-wrap">
      <article class="kks-story-sheet" id="kks-first-page-article">
        <span class="kks-story-badge">${data.category}</span>
        <h1 class="kks-story-heading">${data.title}</h1>
        <div class="kks-story-meta">लेखक: ${data.author}</div>
        <div class="kks-story-reader" id="kks-story-reader-body">
          ${bodyHtml}
        </div>
      </article>
    </div>
  `;

  return data;
}
