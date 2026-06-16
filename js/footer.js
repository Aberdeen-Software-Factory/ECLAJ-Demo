const footerMount = document.querySelector("#site-footer");
const fallbackYear = 2026;

// Outputs the browser's current four-digit year for the footer.
// Uses the launch year if Date is unavailable, invalid, or set too far back.
function getCurrentYear() {
  try {
    const year = new Date().getFullYear();
    return Number.isFinite(year) && year >= fallbackYear ? year : fallbackYear;
  } catch {
    return fallbackYear;
  }
}

if (footerMount) {
  const base = window.location.pathname.includes('/pages/') ? '../' : '';
  const currentYear = getCurrentYear();
  footerMount.innerHTML = `
    <footer>
      <div class="foot-inner">
        <div class="foot-left">
          <span class="foot-text">UK-CLAD &copy; ${currentYear}</span>
          <span class="foot-sep">|</span>
          <img src="${base}assets/images/UoA-Primary-Logo-RGB-2023.png" alt="University of Aberdeen" class="foot-logo foot-logo-light">
          <img src="${base}assets/images/UoA-Primary-Logo-MONO-white.png" alt="University of Aberdeen" class="foot-logo foot-logo-dark">
        </div>
        <nav aria-label="Footer navigation">
          <a href="#">Link one</a>
          <a href="#">Link two</a>
          <a href="#">Link three</a>
        </nav>
      </div>
    </footer>
  `;
}
