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
    label: "8. Full case (All phases)",
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

function escapeSpreadsheetText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createEstimateSpreadsheetRows(estimate) {
  const inputRows = [
    ["Case complexity tier", estimate.labels.tier],
    ["Procedural phase", estimate.labels.phase],
    ["Non-solicitor fees included", estimate.inputs.includeNonSolicitorFees ? "Yes" : "No"],
  ];
  const outputRows = [
    ["Estimated billable hours", formatHours(estimate.billableHours)],
    ["Base solicitor fees", formatCurrency(estimate.baseSolicitorFees)],
    ["Disbursement factor", estimate.disbursementFactor],
    ["Estimated disbursements", formatCurrency(estimate.estimatedDisbursements)],
    ["Total claimed cost", formatCurrency(estimate.totalClaimedCost)],
    ["Compensated costs [56.6% Rule 104]", formatCurrency(estimate.compensatedCosts)],
    ["Unrecoverable sunk cost", formatCurrency(estimate.unrecoverableSunkCost)],
  ];

  const rowCount = Math.max(inputRows.length, outputRows.length);

  return Array.from({ length: rowCount }, (_, index) => {
    const inputRow = inputRows[index] || ["", ""];
    const outputRow = outputRows[index] || ["", ""];

    return [inputRow[0], inputRow[1], outputRow[0], outputRow[1]];
  });
}

function buildEstimateWorksheetXml(estimate) {
  const renderInlineStringCell = (value) => (
    `<c t="inlineStr"><is><t>${escapeSpreadsheetText(value)}</t></is></c>`
  );
  const bodyRows = createEstimateSpreadsheetRows(estimate)
    .map((row, rowIndex) => (
      `<row r="${rowIndex + 3}">${row.map(renderInlineStringCell).join("")}</row>`
    ))
    .join("");

  return `<?xml version="1.0"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>
    <col min="1" max="1" width="28" customWidth="1"/>
    <col min="2" max="2" width="24" customWidth="1"/>
    <col min="3" max="3" width="32" customWidth="1"/>
    <col min="4" max="4" width="24" customWidth="1"/>
  </cols>
  <sheetData>
    <row r="1">
      <c t="inlineStr"><is><t>Inputs</t></is></c>
      <c/>
      <c t="inlineStr"><is><t>Outputs</t></is></c>
    </row>
    <row r="2"/>
      ${bodyRows}
  </sheetData>
  <mergeCells count="2">
    <mergeCell ref="A1:B1"/>
    <mergeCell ref="C1:D1"/>
  </mergeCells>
</worksheet>`;
}

function createCrc32Table() {
  return Array.from({ length: 256 }, (_, index) => {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    return value >>> 0;
  });
}

const CRC32_TABLE = createCrc32Table();

function calculateCrc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(bytes, value) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(bytes, value) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function createZip(files) {
  const encoder = new TextEncoder();
  const output = [];
  const centralDirectory = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = calculateCrc32(dataBytes);

    writeUint32(output, 0x04034b50);
    writeUint16(output, 20);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint32(output, crc);
    writeUint32(output, dataBytes.length);
    writeUint32(output, dataBytes.length);
    writeUint16(output, nameBytes.length);
    writeUint16(output, 0);
    output.push(...nameBytes, ...dataBytes);

    writeUint32(centralDirectory, 0x02014b50);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, crc);
    writeUint32(centralDirectory, dataBytes.length);
    writeUint32(centralDirectory, dataBytes.length);
    writeUint16(centralDirectory, nameBytes.length);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, 0);
    writeUint32(centralDirectory, offset);
    centralDirectory.push(...nameBytes);

    offset = output.length;
  });

  const centralDirectoryOffset = output.length;
  output.push(...centralDirectory);

  writeUint32(output, 0x06054b50);
  writeUint16(output, 0);
  writeUint16(output, 0);
  writeUint16(output, files.length);
  writeUint16(output, files.length);
  writeUint32(output, centralDirectory.length);
  writeUint32(output, centralDirectoryOffset);
  writeUint16(output, 0);

  return new Uint8Array(output);
}

function buildEstimateSpreadsheetXlsx(estimate) {
  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Cost estimate" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: buildEstimateWorksheetXml(estimate),
    },
  ]);
}

function createEstimateSpreadsheetFilename(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `uk-clad-cost-estimate-${year}-${month}-${day}-${hours}${minutes}.xlsx`;
}

function downloadEstimateSpreadsheet(estimate) {
  const blob = new Blob([buildEstimateSpreadsheetXlsx(estimate)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = createEstimateSpreadsheetFilename();
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const estimatorForm = document.querySelector("#cost-estimator-form");
const downloadSpreadsheetButton = document.querySelector("#download-spreadsheet");

if (estimatorForm) {
  const submitButton = estimatorForm.querySelector('button[type="submit"]');
  let currentEstimate = null;

  const updateEstimate = () => {
    const inputs = getEstimatorInputs(estimatorForm);
    const canCalculate = canCalculateEstimate(inputs);

    if (submitButton) {
      submitButton.disabled = !canCalculate;
    }

    if (!canCalculate) {
      currentEstimate = null;
      if (downloadSpreadsheetButton) {
        downloadSpreadsheetButton.disabled = true;
      }
      renderEmptyEstimate();
      return;
    }

    currentEstimate = calculateEstimate(inputs);
    if (downloadSpreadsheetButton) {
      downloadSpreadsheetButton.disabled = false;
    }
    renderEstimate(currentEstimate);
  };

  estimatorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateEstimate();
  });

  if (downloadSpreadsheetButton) {
    downloadSpreadsheetButton.addEventListener("click", () => {
      if (currentEstimate) {
        downloadEstimateSpreadsheet(currentEstimate);
        // Track only after the workbook download is triggered so abandoned or
        // disabled clicks are not counted as spreadsheet downloads.
        window.ukCladAnalytics?.trackEvent("estimator_spreadsheet_download", {
          link_text: downloadSpreadsheetButton.textContent.trim(),
          link_url: "uk-clad-cost-estimate.xlsx",
          dataset_name: currentEstimate.labels.phase,
          dataset_version: currentEstimate.labels.tier,
          dataset_format: "XLSX",
          include_non_solicitor_fees: String(currentEstimate.inputs.includeNonSolicitorFees),
          source: "cost_estimator",
        });
      }
    });
  }

  estimatorForm.addEventListener("input", updateEstimate);
  estimatorForm.addEventListener("change", updateEstimate);
  updateEstimate();
}
