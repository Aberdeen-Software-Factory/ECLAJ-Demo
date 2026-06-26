(() => {
  const STORAGE_KEY = "uk-clad-cookie-consent";
  const CONSENT_EVENT = "ukclad:cookie-consent-change";

  function getStoredConsent() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const consent = JSON.parse(stored);
      if (typeof consent.analytics !== "boolean") return null;

      return consent;
    } catch {
      return null;
    }
  }

  function saveConsent(analytics) {
    const consent = {
      analytics,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
    updateBanner();
    closePreferences();

    return consent;
  }

  function hasAnalyticsConsent() {
    return getStoredConsent()?.analytics === true;
  }

  function ensurePreferencesModal() {
    let modal = document.querySelector(".cookie-preferences-modal");

    if (modal) return modal;

    const backdrop = document.createElement("div");
    backdrop.className = "cookie-preferences-backdrop";
    backdrop.hidden = true;

    modal = document.createElement("section");
    modal.className = "cookie-preferences-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "cookie-preferences-title");
    modal.innerHTML = `
      <div class="cookie-preferences-panel">
        <div class="cookie-preferences-heading">
          <h2 id="cookie-preferences-title">Cookie settings</h2>
          <button class="cookie-icon-button" type="button" data-cookie-close aria-label="Close cookie preferences">x</button>
        </div>
        <div class="cookie-preferences-body">
          <section class="cookie-settings-intro">
            <h3>Cookie usage</h3>
            <p>We use cookies to ensure the basic functionality of the website and to improve the prototype experience.</p>
          </section>
          <div class="cookie-option">
            <div class="cookie-option-summary" data-cookie-toggle-details role="button" tabindex="0" aria-expanded="true">
              <span class="cookie-option-chevron" aria-hidden="true">^</span>
              <span>Strictly necessary cookies</span>
              <span class="cookie-switch cookie-switch-on cookie-switch-readonly" aria-hidden="true">
                <span class="cookie-switch-knob">
                  <span class="cookie-switch-icon cookie-switch-icon-on"></span>
                  <span class="cookie-switch-icon cookie-switch-icon-off"></span>
                </span>
              </span>
            </div>
            <p class="cookie-option-detail">Required for the site to function correctly. These cookies cannot be disabled.</p>
          </div>
          <div class="cookie-option">
            <div class="cookie-option-summary" data-cookie-toggle-details role="button" tabindex="0" aria-expanded="true">
              <span class="cookie-option-chevron" aria-hidden="true">^</span>
              <span>Analytics cookies</span>
              <button class="cookie-switch" type="button" data-cookie-analytics-toggle aria-label="Toggle analytics cookies" aria-pressed="false">
                <span class="cookie-switch-knob">
                  <span class="cookie-switch-icon cookie-switch-icon-on"></span>
                  <span class="cookie-switch-icon cookie-switch-icon-off"></span>
                </span>
              </button>
            </div>
            <p class="cookie-option-detail">
              Help us understand page views, dataset and download clicks, estimator spreadsheet downloads, coding book
              clicks, and survey clicks. Google Analytics will only be enabled if you accept analytics cookies.
            </p>
          </div>
          <a class="cookie-policy-link" href="${getPrivacyHref()}">Read privacy and cookie information</a>
        </div>
        <div class="cookie-modal-footer">
          <button type="button" class="cookie-button cookie-button-primary" data-cookie-accept>Accept all cookies</button>
          <button type="button" class="cookie-button cookie-button-secondary" data-cookie-reject>Accept necessary only</button>
          <button type="button" class="cookie-button cookie-button-secondary" data-cookie-save>Save preferences</button>
        </div>
      </div>
    `;

    document.body.append(backdrop, modal);
    backdrop.addEventListener("click", closePreferences);
    modal.querySelector("[data-cookie-close]").addEventListener("click", closePreferences);
    modal.querySelector("[data-cookie-accept]").addEventListener("click", acceptAnalytics);
    modal.querySelector("[data-cookie-reject]").addEventListener("click", rejectAnalytics);
    modal.querySelector("[data-cookie-save]").addEventListener("click", saveCurrentPreferences);
    modal.querySelector("[data-cookie-analytics-toggle]").addEventListener("click", toggleAnalyticsPreference);
    modal.querySelectorAll("[data-cookie-toggle-details]").forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        if (event.target.closest(".cookie-switch")) return;
        const isExpanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isExpanded));
        toggle.closest(".cookie-option").classList.toggle("cookie-option-collapsed", isExpanded);
      });
      toggle.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggle.click();
      });
    });

    return modal;
  }

  function getPrivacyHref() {
    return window.location.pathname.includes("/pages/") ? "privacy.html" : "pages/privacy.html";
  }

  function openPreferences() {
    const modal = ensurePreferencesModal();
    const backdrop = document.querySelector(".cookie-preferences-backdrop");

    setAnalyticsPreference(hasAnalyticsConsent());
    if (backdrop) backdrop.hidden = false;
    modal.hidden = false;
    modal.querySelector("[data-cookie-close]").focus();
  }

  function closePreferences() {
    const modal = document.querySelector(".cookie-preferences-modal");
    const backdrop = document.querySelector(".cookie-preferences-backdrop");

    if (modal) modal.hidden = true;
    if (backdrop) backdrop.hidden = true;
  }

  function acceptAnalytics() {
    return saveConsent(true);
  }

  function rejectAnalytics() {
    return saveConsent(false);
  }

  function setAnalyticsPreference(isEnabled) {
    const toggle = document.querySelector("[data-cookie-analytics-toggle]");
    if (!toggle) return;

    toggle.setAttribute("aria-pressed", String(isEnabled));
    toggle.classList.toggle("cookie-switch-on", isEnabled);
  }

  function toggleAnalyticsPreference() {
    const toggle = document.querySelector("[data-cookie-analytics-toggle]");
    const isEnabled = toggle?.getAttribute("aria-pressed") === "true";
    setAnalyticsPreference(!isEnabled);
  }

  function saveCurrentPreferences() {
    const toggle = document.querySelector("[data-cookie-analytics-toggle]");
    return saveConsent(toggle?.getAttribute("aria-pressed") === "true");
  }

  function ensureBanner() {
    let banner = document.querySelector(".cookie-consent-banner");

    if (banner) return banner;

    banner = document.createElement("section");
    banner.className = "cookie-consent-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML = `
      <div class="cookie-banner-copy">
        <h2>We use cookies</h2>
        <p>
          Analytics cookies help us improve the UK-CLAD prototype and make the experience better. Please consider
          accepting analytics cookies, or you can continue with only the essential cookies. Learn more about how Google
          uses information from sites or apps that use their services at
          <strong>google.com/policies/privacy/partners.</strong>
        </p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="cookie-button cookie-button-primary" data-cookie-accept>Accept all cookies</button>
        <button type="button" class="cookie-button cookie-button-secondary" data-cookie-reject>Accept necessary only</button>
        <button type="button" class="cookie-button cookie-button-muted" data-cookie-manage>Manage preferences</button>
      </div>
    `;

    document.body.appendChild(banner);
    banner.querySelector("[data-cookie-accept]").addEventListener("click", acceptAnalytics);
    banner.querySelector("[data-cookie-reject]").addEventListener("click", rejectAnalytics);
    banner.querySelector("[data-cookie-manage]").addEventListener("click", openPreferences);

    return banner;
  }

  function updateBanner() {
    const banner = ensureBanner();
    banner.hidden = Boolean(getStoredConsent());
  }

  function bindFooterControl() {
    document.querySelectorAll("[data-cookie-preferences]").forEach((button) => {
      button.addEventListener("click", openPreferences);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindFooterControl();
    updateBanner();
  });

  window.ukCladCookieConsent = {
    getConsent: getStoredConsent,
    hasAnalyticsConsent,
    openPreferences,
    acceptAnalytics,
    rejectAnalytics,
  };
})();
