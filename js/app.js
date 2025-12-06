// app.js - vanilla JS
const FACTIONS = [
{ key: 'the_tech', name: 'The Tech', logo: 'assets/the_tech/logo.png' },
{ key: 'the_enlisted', name: 'The Enlisted', logo: 'assets/the_enlisted/logo.png' },
{ key: 'the_union', name: 'The Union', logo: 'assets/the_union/logo.png' },
{ key: 'the_conglomerate', name: 'The Conglomerate', logo: 'assets/the_conglomerate/logo.png' },
{ key: 'the_reclaimed', name: 'The Reclaimed', logo: 'assets/the_reclaimed/logo.png' },
{ key: 'the_corsairs', name: 'The Corsairs', logo: 'assets/the_corsairs/logo.png' }
];


// State
let currentFaction = null;
let unitsData = []; // loaded JSON for current faction
let selectedUnits = []; // {id,name,cost,image}
let pointLimit = 60;


// DOM
const factionGrid = document.getElementById('factionGrid');
const factionSelectSection = document.getElementById('faction-select');
const unitBuilderSection = document.getElementById('unit-builder');
const selectedFactionName = document.getElementById('selectedFactionName');
const pointLimitEl = document.getElementById('pointLimit');
const limitPointsEl = document.getElementById('limitPoints');
const usedPointsEl = document.getElementById('usedPoints');
const openAddUnitBtn = document.getElementById('openAddUnit');
const unitsModal = document.getElementById('unitsModal');
const closeUnitsModal = document.getElementById('closeUnitsModal');
const availableUnitsEl = document.getElementById('availableUnits');
const unitListEl = document.getElementById('unitList');
const backBtn = document.getElementById('backBtn');


const imageModal = document.getElementById('imageModal');
const closeImageModal = document.getElementById('closeImageModal');
const previewImage = document.getElementById('previewImage');
const previewName = document.getElementById('previewName');


// Init
function init(){
renderFactionButtons();
pointLimitEl.value = '60';
limitPointsEl.textContent = pointLimit;
pointLimitEl.addEventListener('change', onPointLimitChange);
openAddUnitBtn.addEventListener('click', openUnitsModal);
closeUnitsModal.addEventListener('click', closeUnitsModalFn);
backBtn.addEventListener('click', goBack);
closeImageModal.addEventListener('click', ()=>imageModal.classList.add('hidden'));
}


function renderFactionButtons(){
FACTIONS.forEach(f =>{
const btn = document.createElement('button');
btn.className = 'faction-btn';
btn.innerHTML = `\n <img src="${f.logo}" alt="${f.name} logo" class="faction-logo" onerror="this.style.opacity=0.12">\n <div class="faction-name">${f.name}</div>\n `;
btn.addEventListener('click', ()=>selectFaction(f));
factionGrid.appendChild(btn);
})
}


function selectFaction(f){
currentFaction = f;
selectedFactionName.textContent = f.name;
factionSelectSection.classList.add('hidden');
unitBuilderSection.classList.remove('hidden');
loadFactionData(f.key);
}


function goBack(){
// reset
currentFaction = null; unitsData = []; selectedUnits = [];
usedPointsEl.textContent = '0';
unitListEl.innerHTML = '';
refreshPoints();