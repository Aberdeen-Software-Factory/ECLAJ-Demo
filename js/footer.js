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
          <span class="foot-text">&copy; University of Aberdeen, ${currentYear}. All rights reserved.</span>
          <span class="foot-text">Funded by the University of Aberdeen (Agile Grant, Project ID 12073249).</span>
        </div>
        <nav aria-label="Footer navigation">
          <a href="${base}pages/about.html">About</a>
          <a href="${base}pages/contact.html">Contact</a>
          <a href="${base}pages/privacy.html">Privacy and cookies</a>
          <button type="button" data-cookie-preferences>Cookie preferences</button>
        </nav>
      </div>
    </footer>
  `;
}
