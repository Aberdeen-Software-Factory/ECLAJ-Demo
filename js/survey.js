const SURVEY_URL = "https://forms.office.com/Pages/ResponsePage.aspx?id=TEMP_SURVEY_LINK";
const SURVEY_OPEN_DELAY_MS = 3000;

document.addEventListener("DOMContentLoaded", () => {
  const surveyLinks = document.querySelectorAll("[data-survey-link]");
  const trackSurveyClick = (source) => {
    window.ukCladAnalytics?.trackEvent("survey_click", { source });
  };

  surveyLinks.forEach((link) => {
    link.href = SURVEY_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", () => trackSurveyClick("inline"));
  });

  const panel = document.createElement("div");
  panel.className = "survey-panel";
  panel.id = "surveyPanel";
  panel.setAttribute("role", "complementary");
  panel.setAttribute("aria-label", "Survey invitation");
  panel.innerHTML = `
    <button class="survey-panel-close" id="surveyPanelClose" aria-label="Close survey invitation">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <p class="survey-panel-heading">Share your feedback</p>
    <p class="survey-panel-body">Help us improve UK-CLAD by taking a short survey.</p>
    <a href="${SURVEY_URL}" target="_blank" rel="noopener noreferrer" class="survey-panel-btn" data-survey-link>Take the survey</a>
  `;

  const tab = document.createElement("button");
  tab.className = "survey-tab";
  tab.id = "surveyTab";
  tab.setAttribute("aria-label", "Open feedback survey");
  tab.innerHTML = '<span class="survey-tab-text">Feedback</span>';

  document.body.appendChild(panel);
  document.body.appendChild(tab);

  const openPanel = () => {
    panel.classList.add("is-open");
    tab.classList.remove("is-visible");
  };

  const closePanel = () => {
    panel.classList.remove("is-open");
    tab.classList.add("is-visible");
    sessionStorage.setItem("surveyDismissed", "1");
  };

  document.getElementById("surveyPanelClose")?.addEventListener("click", closePanel);
  tab.addEventListener("click", openPanel);
  panel.querySelector(".survey-panel-btn")?.addEventListener("click", () => trackSurveyClick("panel"));

  if (sessionStorage.getItem("surveyDismissed")) {
    tab.classList.add("is-visible");
  } else {
    const timer = window.setTimeout(() => openPanel(), SURVEY_OPEN_DELAY_MS);
    window.addEventListener("pagehide", () => window.clearTimeout(timer), { once: true });
  }
});
