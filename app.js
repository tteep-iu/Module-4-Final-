const API_URL = 'https://68974f0f250b078c20418ac1.mockapi.io/popmart-api/v1/characters';
const MAX_FEATURED = 6;


let allCharacters = [];


const gridEl = document.querySelector('.character__grid');
const searchInput = document.querySelector('.search__bar-input');
const charactersBtn = document.getElementById('charactersBtn');
const dropdownEl = document.getElementById('charDropdown');
const homeLink = document.getElementById('homeLink');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');


function formatPrice(n){ 
  return `$${Number(n).toFixed(2)}`; 
}

function imgSrcFor(item){ 
  return `assets/${item.image}`; 
}

function showSkeletons(count = MAX_FEATURED){
const cards = Array.from({length: count}).map(() => `
<div class="character__card skeleton">
<div class="skel skel-img"></div>
<div class="skel skel-line"></div>
<div class="skel skel-line short"></div>
<div class="skel skel-line tiny"></div>
</div>
`).join('');
gridEl.innerHTML = cards;
}


function cardHTML(item){
const src = imgSrcFor(item);
return `
<div class="character__card">
<img class="character__card-img" src="${src}" alt="${item.name}" onerror="this.onerror=null;this.src='assets/placeholder.jpg';" />
<h3>${item.name}</h3>
<p>${item.series}</p>
<p>${formatPrice(item.price)}</p>
</div>
`;
}

function render(list){
const items = (Array.isArray(list) ? list : []).slice(0, MAX_FEATURED);
gridEl.innerHTML = items.length ? items.map(cardHTML).join('') : '<p>No results found.</p>';
}


function populateDropdown(list){
const names = [...new Set(list.map(c => c.name))].sort((a,b)=>a.localeCompare(b));
dropdownEl.innerHTML = names.map(n => `<li><a href="#" data-name="${n}">${n}</a></li>`).join('');
}


function toggleDropdown(forceOpen){
const open = forceOpen ?? dropdownEl.hasAttribute('hidden');
if(open){ dropdownEl.removeAttribute('hidden'); charactersBtn.setAttribute('aria-expanded','true'); }
else { dropdownEl.setAttribute('hidden',''); charactersBtn.setAttribute('aria-expanded','false'); }
}


function onDropdownClick(e){
const link = e.target.closest('a[data-name]');
if(!link) return;
e.preventDefault();
const name = link.dataset.name.toLowerCase();
const filtered = allCharacters.filter(c => c.name.toLowerCase() === name);
render(filtered);
toggleDropdown(false);
searchInput.value = '';
}


function handleSearch(e){
const q = e.target.value.trim().toLowerCase();
if(!q){ render(allCharacters); return; }
const filtered = allCharacters.filter(c => c.name.toLowerCase().includes(q) || c.series.toLowerCase().includes(q));
render(filtered);
}


async function init(){
showSkeletons();
try{
// small delay so skeleton is visible even if API is fast
const [res] = await Promise.all([
fetch(API_URL),
new Promise(r => setTimeout(r, 700))
]);
if(!res.ok) throw new Error(`HTTP ${res.status}`);
allCharacters = await res.json();
render(allCharacters);
populateDropdown(allCharacters);
}catch(err){
console.error(err);
gridEl.innerHTML = '<p>Failed to load characters. Please try again.</p>';
}
}

searchInput?.addEventListener('input', handleSearch);
charactersBtn?.addEventListener('click', () => toggleDropdown());
dropdownEl?.addEventListener('click', onDropdownClick);

document.addEventListener('click', (e) => {
const inside = e.target.closest('#charactersBtn') || e.target.closest('#charDropdown');
if(!inside) toggleDropdown(false);
});
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') toggleDropdown(false); });

homeLink?.addEventListener('click', (e) => {
e.preventDefault();
searchInput.value = '';
render(allCharacters);
toggleDropdown(false);
});

navToggle?.addEventListener('click', () => navLinks.classList.toggle('nav__links--open'));


document.addEventListener('DOMContentLoaded', init);