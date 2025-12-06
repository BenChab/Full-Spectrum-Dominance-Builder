// app.js - vanilla JS (version corrigée)

// Factions list
const FACTIONS = [
  { key: "the_tech", name: "The Tech", logo: "assets/the_tech/logo.png" },
  { key: "the_enlisted", name: "The Enlisted", logo: "assets/the_enlisted/logo.png" },
  { key: "the_union", name: "The Union", logo: "assets/the_union/logo.png" },
  { key: "the_conglomerate", name: "The Conglomerate", logo: "assets/the_conglomerate/logo.png" },
  { key: "the_reclaimed", name: "The Reclaimed", logo: "assets/the_reclaimed/logo.png" },
  { key: "the_corsairs", name: "The Corsairs", logo: "assets/the_corsairs/logo.png" }
];

// State
let currentFaction = null;
let unitsData = [];
let selectedUnits = [];
let pointLimit = 60;

// DOM refs (will be assigned after DOM is ready)
let factionGrid, factionSelectSection, unitBuilderSection, selectedFactionName;
let pointLimitEl, limitPointsEl, usedPointsEl, openAddUnitBtn;
let unitsModal, closeUnitsModal, availableUnitsEl, unitListEl, backBtn;
let imageModal, closeImageModal, previewImage, previewName;

function cacheDom() {
  factionGrid = document.getElementById("factionGrid");
  factionSelectSection = document.getElementById("faction-select");
  unitBuilderSection = document.getElementById("unit-builder");
  selectedFactionName = document.getElementById("selectedFactionName");
  pointLimitEl = document.getElementById("pointLimit");
  limitPointsEl = document.getElementById("limitPoints");
  usedPointsEl = document.getElementById("usedPoints");
  openAddUnitBtn = document.getElementById("openAddUnit");
  unitsModal = document.getElementById("unitsModal");
  closeUnitsModal = document.getElementById("closeUnitsModal");
  availableUnitsEl = document.getElementById("availableUnits");
  unitListEl = document.getElementById("unitList");
  backBtn = document.getElementById("backBtn");

  imageModal = document.getElementById("imageModal");
  closeImageModal = document.getElementById("closeImageModal");
  previewImage = document.getElementById("previewImage");
  previewName = document.getElementById("previewName");
}

function safeAddListener(el, ev, fn) {
  if (!el) {
    console.warn("Attempted to attach listener but element is null:", ev, fn);
    return;
  }
  el.addEventListener(ev, fn);
}

// Init after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  init();
});

function init() {
  // Defensive checks
  if (!factionGrid) {
    console.error("DOM not found: factionGrid");
    return;
  }

  renderFactionButtons();

  // default points
  if (pointLimitEl) pointLimitEl.value = "60";
  if (limitPointsEl) limitPointsEl.textContent = pointLimit;

  safeAddListener(pointLimitEl, "change", onPointLimitChange);
  safeAddListener(openAddUnitBtn, "click", async () => {
    // Safety: don't open if units not loaded
    if (!currentFaction) {
      alert("Aucune faction sélectionnée.");
      return;
    }
    if (!unitsData || unitsData.length === 0) {
      // try to load again (maybe first load failed)
      await loadFactionData(currentFaction.key);
      if (!unitsData || unitsData.length === 0) {
        alert("Aucune unité trouvée pour cette faction (fichier JSON vide ou manquant).");
        return;
      }
    }
    openUnitsModal();
  });

  safeAddListener(closeUnitsModal, "click", closeUnitsModalFn);
  safeAddListener(backBtn, "click", goBack);
  safeAddListener(closeImageModal, "click", () => imageModal && imageModal.classList.remove("open"));

  // Ensure modals are hidden initially (extra safety)
  if (imageModal) imageModal.classList.remove("open");
  if (unitsModal) unitsModal.classList.remove("open");
}

// Render faction buttons
function renderFactionButtons() {
  factionGrid.innerHTML = "";
  FACTIONS.forEach((f) => {
    const btn = document.createElement("button");
    btn.className = "faction-btn";
    btn.type = "button";
    btn.innerHTML = `
      <img src="${f.logo}" alt="${f.name} logo" class="faction-logo" onerror="this.style.opacity=0.12">
      <div class="faction-name">${f.name}</div>
    `;
    btn.addEventListener("click", () => selectFaction(f));
    factionGrid.appendChild(btn);
  });
}

async function selectFaction(f) {
  currentFaction = f;
  selectedFactionName && (selectedFactionName.textContent = f.name);

  // show loading state while fetching JSON
  factionSelectSection && factionSelectSection.classList.add("hidden");
  unitBuilderSection && unitBuilderSection.classList.remove("hidden");

  // load data and wait for it
  await loadFactionData(f.key);
  // if no units found, inform user
  if (!unitsData || unitsData.length === 0) {
    alert("Aucune unité trouvée pour cette faction. Vérifiez data/" + f.key + ".json");
  }
}

function goBack() {
  currentFaction = null;
  unitsData = [];
  selectedUnits = [];

  usedPointsEl && (usedPointsEl.textContent = "0");
  unitListEl && (unitListEl.innerHTML = "");

  factionSelectSection && factionSelectSection.classList.remove("hidden");
  unitBuilderSection && unitBuilderSection.classList.add("hidden");
}

function onPointLimitChange(e) {
  pointLimit = parseInt(e.target.value, 10) || 60;
  if (limitPointsEl) limitPointsEl.textContent = pointLimit;
  refreshPoints();
}

async function loadFactionData(key) {
  unitsData = [];
  try {
    const res = await fetch(`data/${key}.json`, { cache: "no-store" });
    if (!res.ok) {
      console.warn("fetch failed for", key, res.status);
      return;
    }
    const json = await res.json();
    // ensure it's an array
    if (Array.isArray(json)) unitsData = json;
    else console.warn("JSON loaded but not an array:", json);
  } catch (err) {
    console.error("Error loading faction JSON:", err);
  }
}

// open modal listing available units
function openUnitsModal() {
  if (!availableUnitsEl) {
    console.error("availableUnitsEl not found");
    return;
  }
  availableUnitsEl.innerHTML = "";

  // If unitsData empty, show message
  if (!unitsData || unitsData.length === 0) {
    const li = document.createElement("li");
    li.className = "available-item";
    li.textContent = "Aucune unité disponible.";
    availableUnitsEl.appendChild(li);
    unitsModal && unitsModal.classList.add("open");
    return;
  }

  unitsData.forEach((u) => {
    const li = document.createElement("li");
    li.className = "available-item";

    // Use dataset attributes to avoid closure issues
    li.innerHTML = `
      <div>
        <strong>${u.name}</strong>
        <div class="muted">${u.cost} pts</div>
      </div>
      <div>
        <button class="icon-btn" data-eye type="button">👁️</button>
        <button class="primary" data-add type="button">Ajouter</button>
      </div>
    `;

    // query buttons (always present)
    const eyeBtn = li.querySelector("[data-eye]");
    const addBtn = li.querySelector("[data-add]");

    eyeBtn && eyeBtn.addEventListener("click", () => openImagePreview(u));
    addBtn && addBtn.addEventListener("click", () => {
      addUnit(u);
      // optionally close modal or keep open; here we keep it open
      renderSelectedUnits();
    });

    availableUnitsEl.appendChild(li);
  });

  unitsModal && unitsModal.classList.add("open");
}

// close modal
function closeUnitsModalFn() {
  unitsModal && unitsModal.classList.remove("open");
}

function addUnit(u) {
  if (!u || typeof u.cost !== "number") {
    console.warn("Invalid unit", u);
    return;
  }
  const used = selectedUnits.reduce((s, x) => s + (x.cost || 0), 0);
  if (used + u.cost > pointLimit) {
    alert("Ajouter cette unité dépasserait la limite de points.");
    return;
  }
  // we push a shallow copy so repeated additions are independent
  selectedUnits.push({ ...u });
  renderSelectedUnits();
}

function renderSelectedUnits() {
  if (!unitListEl) return;
  unitListEl.innerHTML = "";

  selectedUnits.forEach((u, idx) => {
    const li = document.createElement("li");
    li.className = "unit-item";

    li.innerHTML = `
      <div class="unit-meta">
        <div>
          <strong>${u.name}</strong>
          <div class="muted">${u.cost} pts</div>
        </div>
      </div>
      <div>
        <button class="icon-btn" data-eye type="button">👁️</button>
        <button class="icon-btn" data-del type="button">🗑️</button>
      </div>
    `;

    const eye = li.querySelector("[data-eye]");
    const del = li.querySelector("[data-del]");

    eye && eye.addEventListener("click", () => openImagePreview(u));
    del && del.addEventListener("click", () => {
      selectedUnits.splice(idx, 1);
      renderSelectedUnits();
    });

    unitListEl.appendChild(li);
  });

  refreshPoints();
}

function refreshPoints() {
  const used = selectedUnits.reduce((s, x) => s + (x.cost || 0), 0);
  if (usedPointsEl) usedPointsEl.textContent = used;
  if (limitPointsEl) limitPointsEl.textContent = pointLimit;
}

function openImagePreview(u) {
  if (!imageModal || !previewImage || !previewName) return;
  const imgPath = `assets/${currentFaction.key}/${u.image}`;
  previewImage.src = imgPath;
  previewName.textContent = `${u.name} — ${u.cost} pts`;
  imageModal.classList.add("open");
}
