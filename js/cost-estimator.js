// Source: Interactive_Cost_Estimator.xlsx, hidden sheet
// "Lookup Data (Hidden Engine)"; visible sheet uses 56.6% in Rule 104 outputs.
const RECOVERY_RATE = 0.566;

// Source: hidden sheet row 1 for tier labels and row 2 for disbursement factors.
const ESTIMATOR_TIERS = {
  "fast-track": {
    label: "Fast Track",
    disbursementFactor: 0.3,
  },
  "bilateral-simple": {
    label: "Bilateral: Simple",
    disbursementFactor: 0.6,
  },
  "bilateral-medium": {
    label: "Bilateral: Medium",
    disbursementFactor: 0.9,
  },
  "bilateral-complex": {
    label: "Bilateral: Complex",
    disbursementFactor: 1.2,
  },
  "collective-actions": {
    label: "Collective Actions",
    disbursementFactor: 2,
  },
};

// Source: hidden sheet column A for phase labels.
// `hours` values mirror hidden sheet rows 3-10.
// `baseSolicitorFees` values mirror hidden sheet rows 13-20.
const ESTIMATOR_PHASES = {
  "pre-action-pleadings": {
    label: "1. Pre-Action and Pleadings",
    hours: {
      "fast-track": 50,
      "bilateral-simple": 120,
      "bilateral-medium": 245,
      "bilateral-complex": 400,
      "collective-actions": 800,
    },
    baseSolicitorFees: {
      "fast-track": 31717,
      "bilateral-simple": 76120.8,
      "bilateral-medium": 155413.3,
      "bilateral-complex": 253736,
      "collective-actions": 507472,
    },
  },
  "case-management": {
    label: "2. Case Management (CMCs)",
    hours: {
      "fast-track": 60,
      "bilateral-simple": 140,
      "bilateral-medium": 280,
      "bilateral-complex": 400,
      "collective-actions": 960,
    },
    baseSolicitorFees: {
      "fast-track": 38656.2,
      "bilateral-simple": 90197.8,
      "bilateral-medium": 180395.6,
      "bilateral-complex": 257708,
      "collective-actions": 618499.2,
    },
  },
  "disclosure-discovery": {
    label: "3. Disclosure / Discovery",
    hours: {
      "fast-track": 250,
      "bilateral-simple": 600,
      "bilateral-medium": 1120,
      "bilateral-complex": 1750,
      "collective-actions": 2560,
    },
    baseSolicitorFees: {
      "fast-track": 108540,
      "bilateral-simple": 260496,
      "bilateral-medium": 486259.2,
      "bilateral-complex": 759780,
      "collective-actions": 1111449.6,
    },
  },
  "witness-statements": {
    label: "4. Witness Statements",
    hours: {
      "fast-track": 150,
      "bilateral-simple": 240,
      "bilateral-medium": 420,
      "bilateral-complex": 600,
      "collective-actions": 800,
    },
    baseSolicitorFees: {
      "fast-track": 82842,
      "bilateral-simple": 132547.2,
      "bilateral-medium": 231957.6,
      "bilateral-complex": 331368,
      "collective-actions": 441824,
    },
  },
  "expert-evidence": {
    label: "5. Expert Evidence",
    hours: {
      "fast-track": 100,
      "bilateral-simple": 300,
      "bilateral-medium": 595,
      "bilateral-complex": 900,
      "collective-actions": 1600,
    },
    baseSolicitorFees: {
      "fast-track": 60889,
      "bilateral-simple": 182667,
      "bilateral-medium": 362289.55,
      "bilateral-complex": 548001,
      "collective-actions": 974224,
    },
  },
  "trial-prep-hearing": {
    label: "6. Trial Prep and Hearing",
    hours: {
      "fast-track": 350,
      "bilateral-simple": 500,
      "bilateral-medium": 735,
      "bilateral-complex": 850,
      "collective-actions": 1120,
    },
    baseSolicitorFees: {
      "fast-track": 207165,
      "bilateral-simple": 295950,
      "bilateral-medium": 435046.5,
      "bilateral-complex": 503115,
      "collective-actions": 662928,
    },
  },
  "costs-settlement": {
    label: "7. Costs and Settlement",
    hours: {
      "fast-track": 40,
      "bilateral-simple": 100,
      "bilateral-medium": 105,
      "bilateral-complex": 100,
      "collective-actions": 160,
    },
    baseSolicitorFees: {
      "fast-track": 21618.4,
      "bilateral-simple": 54046,
      "bilateral-medium": 56748.3,
      "bilateral-complex": 54046,
      "collective-actions": 86473.6,
    },
  },
  "full-case": {
    label: "8. FULL CASE (All Phases)",
    hours: {
      "fast-track": 1000,
      "bilateral-simple": 2000,
      "bilateral-medium": 3500,
      "bilateral-complex": 5000,
      "collective-actions": 8000,
    },
    baseSolicitorFees: {
      "fast-track": 551427.6,
      "bilateral-simple": 1092024.8,
      "bilateral-medium": 1908110.05,
      "bilateral-complex": 2707754,
      "collective-actions": 4402870.4,
    },
  },
};

// Currency can be reformatted here, but converting values would need an exchange-rate step.
const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-GB");

/**
 * Excel-backed calculator logic.
 *
 * Mirrors the visible "Interactive Cost Estimator" sheet:
 * - B8/C20:C24: lookup billable hours by phase and tier.
 * - B9: lookup base solicitor fees by phase and tier.
 * - B10/B11: optionally apply the selected tier's disbursement factor.
 * - B13/B14: apply 56.6% recovery, then subtract to get sunk cost.
 */
function calculateEstimate(inputs) {
  const normalizedInputs = normalizeEstimatorInputs(inputs);
  const tier = ESTIMATOR_TIERS[normalizedInputs.tier];
  const phase = ESTIMATOR_PHASES[normalizedInputs.phase];
  const billableHours = phase.hours[normalizedInputs.tier];
  const baseSolicitorFees = phase.baseSolicitorFees[normalizedInputs.tier];
  const estimatedDisbursements = normalizedInputs.includeNonSolicitorFees
    ? baseSolicitorFees * tier.disbursementFactor
    : 0;
  const totalClaimedCost = baseSolicitorFees + estimatedDisbursements;
  const compensatedCosts = totalClaimedCost * RECOVERY_RATE;
  const unrecoverableSunkCost = totalClaimedCost - compensatedCosts;

  return {
    inputs: normalizedInputs,
    labels: {
      tier: tier.label,
      phase: phase.label,
    },
    billableHours,
    baseSolicitorFees,
    disbursementFactor: tier.disbursementFactor,
    estimatedDisbursements,
    totalClaimedCost,
    compensatedCosts,
    unrecoverableSunkCost,
  };
}

function normalizeEstimatorInputs(inputs) {
  const allowedTiers = Object.keys(ESTIMATOR_TIERS);
  const allowedPhases = Object.keys(ESTIMATOR_PHASES);

  if (!allowedTiers.includes(inputs.tier)) {
    throw new RangeError(`tier must be one of: ${allowedTiers.join(", ")}`);
  }

  if (!allowedPhases.includes(inputs.phase)) {
    throw new RangeError(`phase must be one of: ${allowedPhases.join(", ")}`);
  }

  return {
    tier: inputs.tier,
    phase: inputs.phase,
    includeNonSolicitorFees: Boolean(inputs.includeNonSolicitorFees),
  };
}

function formatCurrency(value) {
  // Source: Excel currency cells use number format "£#,##0".
  return currencyFormatter.format(value);
}

function formatHours(value) {
  return `${numberFormatter.format(value)} hours`;
}

function getEstimatorInputs(form) {
  const formData = new FormData(form);

  return {
    tier: formData.get("tier"),
    phase: formData.get("phase"),
    includeNonSolicitorFees: formData.get("includeNonSolicitorFees") === "on",
  };
}

function canCalculateEstimate(inputs) {
  return Boolean(inputs.tier && inputs.phase);
}

function setText(selector, text) {
  const target = document.querySelector(selector);

  if (target) {
    target.textContent = text;
  }
}

function renderEmptyEstimate() {
  setText("#estimated-hours", "-");
  setText("#base-solicitor-fees", "-");
  setText("#disbursement-factor", "-");
  setText("#estimated-disbursements", "-");
  setText("#total-claimed-cost", "-");
  setText("#compensated-costs", "-");
  setText("#unrecoverable-sunk-cost", "-");
}

function renderEstimate(estimate) {
  setText("#estimated-hours", formatHours(estimate.billableHours));
  setText("#base-solicitor-fees", formatCurrency(estimate.baseSolicitorFees));
  setText("#disbursement-factor", String(estimate.disbursementFactor));
  setText("#estimated-disbursements", formatCurrency(estimate.estimatedDisbursements));
  setText("#total-claimed-cost", formatCurrency(estimate.totalClaimedCost));
  setText("#compensated-costs", formatCurrency(estimate.compensatedCosts));
  setText("#unrecoverable-sunk-cost", formatCurrency(estimate.unrecoverableSunkCost));
}

const estimatorForm = document.querySelector("#cost-estimator-form");

if (estimatorForm) {
  const submitButton = estimatorForm.querySelector('button[type="submit"]');

  const updateEstimate = () => {
    const inputs = getEstimatorInputs(estimatorForm);
    const canCalculate = canCalculateEstimate(inputs);

    if (submitButton) {
      submitButton.disabled = !canCalculate;
    }

    if (!canCalculate) {
      renderEmptyEstimate();
      return;
    }

    renderEstimate(calculateEstimate(inputs));
  };

  estimatorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateEstimate();
  });

  estimatorForm.addEventListener("input", updateEstimate);
  estimatorForm.addEventListener("change", updateEstimate);
  updateEstimate();
}
