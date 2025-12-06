// app.js - vanilla JS

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
let unitsData = []; // Loaded JSON for the chosen faction
let selectedUnits = []; // Units added to the list
let pointLimit = 60;

// DOM refs
const factionGrid = document.getElementById("factionGrid");
const factionSelectSection = document.getElementById("faction-select");
const unitBuilderSection = document.getElementById("unit-builder");
const selectedFactionName = document.getElementById("selectedFactionName");
const pointLimitEl = document.getElementById("pointLimit");
const limitPointsEl = document.getElementById("limitPoints");
const usedPointsEl = document.getElementById("usedPoints");
const openAddUnitBtn = document.getElementById("openAddUnit");
const unitsModal = document.getElementById("unitsModal");
const closeUnitsModal = document.getElementById("closeUnitsModal");
const availableUnitsEl = document.getElementById("availableUnits");
const unitListEl = document.getElementById("unitList");
const backBtn = document.getElementById("backBtn");

const imageModal = document.getElementById("imageModal");
const closeImageModal = document.getElementById("closeImageModal");
const previewImage = document.getElementById("previewImage");
const previewName = document.getElementById("previewName");

// Init
function init() {
    renderFactionButtons();
    pointLimitEl.value = "60";
    limitPointsEl.textContent = pointLimit;

    pointLimitEl.addEventListener("change", onPointLimitChange);
    openAddUnitBtn.addEventListener("click", openUnitsModal);
    closeUnitsModal.addEventListener("click", closeUnitsModalFn);
    backBtn.addEventListener("click", goBack);
    closeImageModal.addEventListener("click", () => imageModal.classList.add("hidden"));
    imageModal.classList.add("open");
    imageModal.classList.remove("open");
}

function renderFactionButtons() {
    FACTIONS.forEach((f) => {
        const btn = document.createElement("button");
        btn.className = "faction-btn";
        btn.innerHTML = `
      <img src="${f.logo}" alt="${f.name} logo" class="faction-logo" onerror="this.style.opacity=0.12">
      <div class="faction-name">${f.name}</div>
    `;
        btn.addEventListener("click", () => selectFaction(f));
        factionGrid.appendChild(btn);
    });
}

function selectFaction(f) {
    currentFaction = f;
    selectedFactionName.textContent = f.name;

    factionSelectSection.classList.add("hidden");
    unitBuilderSection.classList.remove("hidden");

    loadFactionData(f.key);
}

function goBack() {
    currentFaction = null;
    unitsData = [];
    selectedUnits = [];

    usedPointsEl.textContent = "0";
    unitListEl.innerHTML = "";

    factionSelectSection.classList.remove("hidden");
    unitBuilderSection.classList.add("hidden");
}

function onPointLimitChange(e) {
    pointLimit = parseInt(e.target.value, 10);
    limitPointsEl.textContent = pointLimit;
    refreshPoints();
}

async function loadFactionData(key) {
    try {
        const res = await fetch(`data/${key}.json`);
        if (!res.ok) throw new Error("Impossible de charger le JSON: " + res.status);
        unitsData = await res.json();
    } catch (err) {
        unitsData = [];
        console.error(err);
        alert("Erreur lors du chargement des données pour la faction. Vérifiez que data/" + key + ".json existe.");
    }
}

function openUnitsModal() {
    availableUnitsEl.innerHTML = "";

    unitsData.forEach((u) => {
        const li = document.createElement("li");
        li.className = "available-item";

        li.innerHTML = `
      <div>
        <strong>${u.name}</strong>
        <div class="muted">${u.cost} pts</div>
      </div>
      <div>
        <button class="icon-btn" data-eye>👁️</button>
        <button class="primary" data-add>Ajouter</button>
      </div>
    `;

        li.querySelector("[data-eye]").addEventListener("click", () => openImagePreview(u));
        li.querySelector("[data-add]").addEventListener("click", () => addUnit(u));

        availableUnitsEl.appendChild(li);
    });

    unitsModal.classList.remove("hidden");
}

function closeUnitsModalFn() {
    unitsModal.classList.add("hidden");
}

function addUnit(u) {
    const used = selectedUnits.reduce((s, x) => s + x.cost, 0);

    if (used + u.cost > pointLimit) {
        alert("Ajouter cette unité dépasserait la limite de points.");
        return;
    }

    selectedUnits.push(u);
    renderSelectedUnits();
}

function renderSelectedUnits() {
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
        <button class="icon-btn" data-eye>👁️</button>
        <button class="icon-btn" data-del>🗑️</button>
      </div>
    `;

        li.querySelector("[data-eye]").addEventListener("click", () => openImagePreview(u));
        li.querySelector("[data-del]").addEventListener("click", () => {
            selectedUnits.splice(idx, 1);
            renderSelectedUnits();
        });

        unitListEl.appendChild(li);
    });

    refreshPoints();
}

function refreshPoints() {
    const used = selectedUnits.reduce((s, x) => s + x.cost, 0);
    usedPointsEl.textContent = used;
    limitPointsEl.textContent = pointLimit;
}

function openImagePreview(u) {
    const imgPath = `assets/${currentFaction.key}/${u.image}`;
    previewImage.src = imgPath;
    previewName.textContent = `${u.name} — ${u.cost} pts`;

    imageModal.classList.remove("hidden");
}

// Start the application
init();
