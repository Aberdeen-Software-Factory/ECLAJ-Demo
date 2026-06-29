(function () {
  const scriptUrl = document.currentScript?.src || window.location.href;
  const statsUrl = new URL("../assets/data/site-stats.json", scriptUrl);

  function valueAtPath(data, path) {
    return path.split(".").reduce((current, key) => {
      if (current && Object.prototype.hasOwnProperty.call(current, key)) {
        return current[key];
      }
      return undefined;
    }, data);
  }

  function renderStats(stats) {
    document.querySelectorAll("[data-site-stat]").forEach((element) => {
      const value = valueAtPath(stats, element.dataset.siteStat);
      if (value === undefined || value === null || value === "") return;

      element.textContent = value;
      if (element.classList.contains("stat-counter")) {
        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
          element.dataset.target = String(numericValue);
        }
      }
    });
  }

  fetch(statsUrl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load site stats: ${response.status}`);
      }
      return response.json();
    })
    .then(renderStats)
    .catch((error) => {
      console.warn(error.message);
    });
})();
