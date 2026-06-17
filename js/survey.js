const SURVEY_URL = "https://forms.office.com/Pages/ResponsePage.aspx?id=TEMP_SURVEY_LINK";
const SURVEY_NUDGE_DELAY_MS = 120000;

document.addEventListener("DOMContentLoaded", () => {
  const surveyLinks = document.querySelectorAll("[data-survey-link]");

  surveyLinks.forEach((link) => {
    link.href = SURVEY_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  const isEstimatorPage = Boolean(document.querySelector(".estimator-grid"));

  const floatingSurvey = document.createElement("div");
  floatingSurvey.className = "survey-float";
  floatingSurvey.id = "surveyFloat";
  floatingSurvey.innerHTML = `
    <a href="${SURVEY_URL}" target="_blank" rel="noopener noreferrer" class="survey-float-btn" id="surveyFloatBtn" aria-label="Open temporary survey link in a new tab">
      <span class="survey-float-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
          <rect x="9" y="2" width="6" height="4" rx="1"></rect>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <line x1="12" y1="11" x2="12" y2="17"></line>
          <line x1="9" y1="14" x2="15" y2="14"></line>
        </svg>
      </span>
      <span class="survey-float-label">Take the survey</span>
    </a>
  `;
  document.body.appendChild(floatingSurvey);
  document.body.classList.add("has-survey-float");

  if (!isEstimatorPage) return;

  const timer = window.setTimeout(() => {
    const button = document.getElementById("surveyFloatBtn");

    if (!button) return;

    button.classList.add("survey-float-btn--nudge");
    button.addEventListener(
      "animationend",
      () => button.classList.remove("survey-float-btn--nudge"),
      { once: true },
    );
  }, SURVEY_NUDGE_DELAY_MS);

  window.addEventListener("pagehide", () => window.clearTimeout(timer), { once: true });
});
