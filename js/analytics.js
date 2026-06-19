(() => {
  /*
   * IMPORTANT: leave this blank until the project has an approved GA4 web
   * data stream and cookie/privacy approach. A real GA4 measurement ID starts
   * with "G-". Once this is filled, accepting analytics cookies can load the
   * Google tag and send the allowlisted events below.
   */
  const GA_MEASUREMENT_ID = "";
  const CONSENT_EVENT = "ukclad:cookie-consent-change";

  /*
   * Keep the event names explicit so page scripts cannot accidentally send
   * arbitrary analytics events. These names are custom GA4 events sent through
   * the official gtag("event", eventName, params) API.
   */
  const TRACKED_EVENT_NAMES = new Set([
    "dataset_request_click",
    "dataset_download_click",
    "coding_book_click",
    "estimator_spreadsheet_download",
    "survey_click",
  ]);

  /*
   * GA4 accepts custom event parameters, but keeping a short allowlist avoids
   * leaking accidental page text or object data into analytics.
   */
  const ALLOWED_PARAM_KEYS = new Set([
    "link_text",
    "link_url",
    "page_path",
    "dataset_name",
    "dataset_version",
    "dataset_format",
    "include_non_solicitor_fees",
    "source",
  ]);
  let isGoogleAnalyticsLoaded = false;

  function hasMeasurementId() {
    // Blank means the harness stays dormant and does not inject Google scripts.
    return GA_MEASUREMENT_ID.trim() !== "";
  }

  function hasAnalyticsConsent() {
    try {
      // Cookie consent is the local source of truth for analytics permission.
      return window.ukCladCookieConsent?.hasAnalyticsConsent() === true;
    } catch {
      return false;
    }
  }

  function loadGoogleAnalytics() {
    /*
     * This project intentionally uses a hard gate: Google Analytics is not
     * loaded unless both a measurement ID and analytics consent exist. Google's
     * Consent Mode is another official option, but it still starts with the
     * Google tag being present on the page.
     */
    if (!hasMeasurementId() || !hasAnalyticsConsent()) return false;
    if (isGoogleAnalyticsLoaded) return true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID);
    isGoogleAnalyticsLoaded = true;

    return true;
  }

  function normaliseEventParams(params = {}) {
    // Always include page_path and coerce allowed custom values to strings.
    const normalised = {
      page_path: window.location.pathname,
    };

    Object.entries(params).forEach(([key, value]) => {
      if (!ALLOWED_PARAM_KEYS.has(key) || value === undefined || value === null) return;
      normalised[key] = String(value);
    });

    return normalised;
  }

  function trackEvent(eventName, params = {}) {
    // Public API used by page scripts. Invalid, unconsented, or disabled calls
    // are silent no-ops so analytics can never break the user-facing page.
    if (!TRACKED_EVENT_NAMES.has(eventName)) return;
    if (!hasMeasurementId() || !hasAnalyticsConsent()) return;
    if (!loadGoogleAnalytics() || typeof window.gtag !== "function") return;

    window.gtag("event", eventName, normaliseEventParams(params));
  }

  window.addEventListener(CONSENT_EVENT, () => {
    // If the user grants analytics after page load, load GA at that point.
    loadGoogleAnalytics();
  });

  window.ukCladAnalytics = {
    trackEvent,
  };

  loadGoogleAnalytics();
})();
