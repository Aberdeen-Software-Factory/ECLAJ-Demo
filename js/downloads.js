const DOWNLOAD_EVENT_NAMES = new Set([
  "dataset_request_click",
  "dataset_download_click",
  "coding_book_click",
]);

function getDownloadTrackingParams(link) {
  // Dataset rows/cards carry metadata so future real links can be tracked
  // without duplicating dataset details in JavaScript.
  const dataset = link.closest("[data-dataset-name]");

  return {
    link_text: link.textContent.trim(),
    link_url: link.href,
    dataset_name: dataset?.dataset.datasetName,
    dataset_version: dataset?.dataset.datasetVersion,
    dataset_format: dataset?.dataset.datasetFormat,
    source: link.dataset.analyticsSource || dataset?.dataset.analyticsSource,
  };
}

function trackDownloadEvent(eventName, params) {
  // Keep each event call explicit so tests and future reviewers can see the
  // exact GA4 custom event names this page may emit.
  if (eventName === "dataset_request_click") {
    window.ukCladAnalytics?.trackEvent("dataset_request_click", params);
  }

  if (eventName === "dataset_download_click") {
    window.ukCladAnalytics?.trackEvent("dataset_download_click", params);
  }

  if (eventName === "coding_book_click") {
    window.ukCladAnalytics?.trackEvent("coding_book_click", params);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Only real anchor links are tracked. Disabled placeholder buttons/spans
  // remain inert and do not generate analytics events.
  document.querySelectorAll("a[data-analytics-event]").forEach((link) => {
    const eventName = link.dataset.analyticsEvent;

    if (!DOWNLOAD_EVENT_NAMES.has(eventName)) return;

    link.addEventListener("click", () => {
      trackDownloadEvent(eventName, getDownloadTrackingParams(link));
    });
  });
});
