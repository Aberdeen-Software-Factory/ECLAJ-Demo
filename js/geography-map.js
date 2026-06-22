(function () {
  const mapEl = document.getElementById("geography-map");
  if (!mapEl || typeof L === "undefined" || typeof MAP_DATA === "undefined") return;

  const AREA_NAMES = {
    AB: "Aberdeen",        AL: "St Albans",         B:  "Birmingham",
    BA: "Bath",            BB: "Blackburn",          BD: "Bradford",
    BH: "Bournemouth",     BL: "Bolton",             BN: "Brighton",
    BR: "Bromley",         BS: "Bristol",            BT: "Belfast",
    CA: "Carlisle",        CB: "Cambridge",          CF: "Cardiff",
    CH: "Chester",         CM: "Chelmsford",         CO: "Colchester",
    CR: "Croydon",         CT: "Canterbury",         CV: "Coventry",
    CW: "Crewe",           DA: "Dartford",           DD: "Dundee",
    DE: "Derby",           DG: "Dumfries",           DH: "Durham",
    DL: "Darlington",      DN: "Doncaster",          DT: "Dorchester",
    DY: "Dudley",          E:  "East London",        EC: "City of London",
    EH: "Edinburgh",       EN: "Enfield",            EX: "Exeter",
    FK: "Falkirk",         FY: "Blackpool",          G:  "Glasgow",
    GL: "Gloucester",      GU: "Guildford",          HA: "Harrow",
    HD: "Huddersfield",    HG: "Harrogate",          HP: "Hemel Hempstead",
    HR: "Hereford",        HU: "Hull",               HX: "Halifax",
    IG: "Ilford",          IP: "Ipswich",            IV: "Inverness",
    JE: "Jersey",          KA: "Kilmarnock",         KT: "Kingston upon Thames",
    KY: "Kirkcaldy",       L:  "Liverpool",          LA: "Lancaster",
    LD: "Llandrindod Wells", LE: "Leicester",        LL: "Llandudno",
    LN: "Lincoln",         LS: "Leeds",              LU: "Luton",
    M:  "Manchester",      ME: "Maidstone",          MK: "Milton Keynes",
    ML: "Motherwell",      N:  "North London",       NE: "Newcastle",
    NG: "Nottingham",      NN: "Northampton",        NP: "Newport",
    NR: "Norwich",         NW: "NW London",          OL: "Oldham",
    OX: "Oxford",          PA: "Paisley",            PE: "Peterborough",
    PH: "Perth",           PL: "Plymouth",           PO: "Portsmouth",
    PR: "Preston",         RG: "Reading",            RH: "Redhill",
    RM: "Romford",         S:  "Sheffield",          SA: "Swansea",
    SE: "SE London",       SG: "Stevenage",          SK: "Stockport",
    SL: "Slough",          SM: "Sutton",             SN: "Swindon",
    SO: "Southampton",     SP: "Salisbury",          SR: "Sunderland",
    SS: "Southend-on-Sea", ST: "Stoke-on-Trent",    SW: "SW London",
    SY: "Shrewsbury",      TA: "Taunton",            TD: "Galashiels",
    TF: "Telford",         TN: "Tonbridge",          TQ: "Torquay",
    TS: "Middlesbrough",   TW: "Twickenham",         UB: "Southall",
    W:  "West London",     WA: "Warrington",         WC: "Central London",
    WD: "Watford",         WF: "Wakefield",          WN: "Wigan",
    WR: "Worcester",       WS: "Walsall",            WV: "Wolverhampton",
    YO: "York",            ZE: "Shetland",
  };

  const TIERS = [
    { min: 1,  max: 4,        color: "#93b8d8", label: "1–4" },
    { min: 5,  max: 9,        color: "#4a87ba", label: "5–9" },
    { min: 10, max: 19,       color: "#1f5c96", label: "10–19" },
    { min: 20, max: Infinity, color: "#0d2f52", label: "20+" },
  ];

  function tierColor(count) {
    return (TIERS.find((t) => count >= t.min && count <= t.max) ?? TIERS.at(-1)).color;
  }

  function circleSize(count, maxCount) {
    return Math.round(24 + Math.sqrt(count / maxCount) * 32);
  }

  const map = L.map("geography-map", {
    center: [54.2, -2.5],
    zoom: 6,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 13,
  }).addTo(map);

  // Use a LayerGroup so we can call clearLayers() cleanly
  const markerLayer = L.layerGroup().addTo(map);

  // State — plain objects so we can read active buttons directly from the DOM
  let activeSectors = new Set(MAP_DATA.sectors);

  function activeViews() {
    return [...document.querySelectorAll("[data-map-view].active")].map((b) => b.dataset.mapView);
  }

  function activeRegions() {
    return [...document.querySelectorAll("[data-map-region].active")].map((b) => b.dataset.mapRegion);
  }

  function areaTotal(area, views) {
    let n = 0;
    for (const view of views) {
      const areaData = MAP_DATA.uk[view]?.[area];
      if (!areaData) continue;
      for (const s of activeSectors) n += areaData[s] || 0;
    }
    return n;
  }

  function renderMarkers() {
    markerLayer.clearLayers();

    const views = activeViews();
    const regions = activeRegions();
    if (views.length === 0 || regions.length === 0) return;

    // International entities have no lat/lng, so nothing to plot when UK is off
    if (!regions.includes("uk")) return;

    const allAreas = new Set([
      ...Object.keys(MAP_DATA.uk.claimants),
      ...Object.keys(MAP_DATA.uk.defendants),
    ]);

    const counts = {};
    for (const area of allAreas) counts[area] = areaTotal(area, views);
    const maxCount = Math.max(...Object.values(counts), 1);

    for (const area of allAreas) {
      const centroid = MAP_DATA.centroids[area];
      if (!centroid) continue;

      const count = counts[area];
      if (count === 0) continue;

      const size = circleSize(count, maxCount);
      const fontSize = Math.max(9, Math.round(size * 0.38));

      const icon = L.divIcon({
        className: "",
        html: `<div class="geo-circle" style="width:${size}px;height:${size}px;background:${tierColor(count)};font-size:${fontSize}px">${count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker(centroid, { icon });

      const cityName = AREA_NAMES[area] ?? area;

      let subheading;
      if (views.length === 2) {
        const c = areaTotal(area, ["claimants"]);
        const d = areaTotal(area, ["defendants"]);
        subheading = `<span class="map-tt-total">${c} claimant${c !== 1 ? "s" : ""} · ${d} defendant${d !== 1 ? "s" : ""}</span>`;
      } else {
        const label = views[0] === "claimants" ? "claimant" : "defendant";
        subheading = `<span class="map-tt-total">${count} ${label}${count !== 1 ? "s" : ""}</span>`;
      }

      const combined = {};
      for (const view of views) {
        const areaData = MAP_DATA.uk[view]?.[area] || {};
        for (const s of activeSectors) {
          if (areaData[s]) combined[s] = (combined[s] || 0) + areaData[s];
        }
      }
      const rows = Object.entries(combined)
        .sort(([, a], [, b]) => b - a)
        .map(([s, n]) => `<span class="map-tt-row"><span>${s}</span><strong>${n}</strong></span>`)
        .join("");

      marker.bindTooltip(
        `<div class="map-tooltip"><strong class="map-tt-area">${cityName}</strong>${subheading}${rows}</div>`,
        { sticky: true, className: "map-tt" }
      );

      marker.on("click", () => {
        map.flyTo(centroid, 9, { duration: 0.6 });
      });

      markerLayer.addLayer(marker);
    }
  }

  // Legend
  const legendEl = document.getElementById("geography-legend-items");
  if (legendEl) {
    TIERS.forEach((t) => {
      const item = document.createElement("div");
      item.className = "geography-legend-item";
      item.innerHTML = `<span class="geography-legend-swatch" style="background:${t.color}"></span>${t.label}`;
      legendEl.appendChild(item);
    });
  }

  // Sector checkboxes
  const filterEl = document.getElementById("geography-sectors");
  if (filterEl) {
    MAP_DATA.sectors.forEach((sector) => {
      const label = document.createElement("label");
      label.className = "geography-sector-label";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = true;
      cb.addEventListener("change", () => {
        if (cb.checked) activeSectors.add(sector);
        else activeSectors.delete(sector);
        renderMarkers();
      });
      label.append(cb, document.createTextNode(" " + sector));
      filterEl.appendChild(label);
    });
  }

  // Claimant/Defendant and UK/International toggles - one will always stay active
  document.querySelectorAll("[data-map-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentlyActive = document.querySelectorAll("[data-map-view].active");
      if (btn.classList.contains("active") && currentlyActive.length > 1) {
        btn.classList.remove("active");
      } else {
        btn.classList.add("active");
      }
      renderMarkers();
    });
  });

  // Region toggles — same logic
  document.querySelectorAll("[data-map-region]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentlyActive = document.querySelectorAll("[data-map-region].active");
      if (btn.classList.contains("active") && currentlyActive.length > 1) {
        btn.classList.remove("active");
      } else {
        btn.classList.add("active");
      }
      renderMarkers();
    });
  });

  renderMarkers();
})();
