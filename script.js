// Utilities
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const format = n => `ZMW ${n.toFixed(2)}`;

// Year in footer
const yearEl = $('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Hero slider (auto-rotating) ----------
(function initHero(){
  const slider = $('[data-hero-slider]');
  if(!slider) return;
  const imgs = $$('#home .hero-slider img');
  let i = 0;
  imgs.forEach((img, idx) => img.style.opacity = idx === 0 ? '1' : '0');
  setInterval(() => {
    imgs[i].style.opacity = '0';
    i = (i + 1) % imgs.length;
    imgs[i].style.opacity = '1';
  }, 4000);
})();

// ---------- Contact form (demo only) ----------
(function initContactForm(){
  const form = $('[data-contact-form]');
  const status = $('[data-contact-status]');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    status.textContent = `Thanks ${data.name}, we’ll reach you at ${data.email}.`;
    form.reset();
    setTimeout(()=> status.textContent = '', 4000);
  });
})();

// ---------- Persistence (localStorage) ----------
const STORE_KEY = 'ci_projects';
const AUTH_KEY = 'ci_admin_auth';

function loadProjects(){
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : defaultProjects();
  } catch {
    return defaultProjects();
  }
}
function saveProjects(list){
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}
function defaultProjects(){
  return [
    { id: uid(), title: 'University teaching lab', img: 'assets/lab-2.jpg', desc: 'Bench systems, fume hoods, hygienic cladding.' },
    { id: uid(), title: 'Hospital diagnostics lab', img: 'assets/lab-3.jpg', desc: 'Cleanroom panels, airflow, compliance fit-out.' },
    { id: uid(), title: 'Research cleanroom', img: 'assets/hero-2.jpg', desc: 'ISO cleanroom cladding and turnkey build.' }
  ];
}
function uid(){ return Math.random().toString(36).slice(2,9); }

// ---------- Public projects render ----------
function renderPublicProjects(){
  const grid = $('[data-projects-grid]');
  if(!grid) return;
  const list = loadProjects();
  grid.innerHTML = list.map(p => `
    <article class="project-card">
      <img src="${p.img}" alt="${p.title}">
      <div class="project-body">
        <strong>${p.title}</strong>
        <p class="muted">${p.desc}</p>
      </div>
    </article>
  `).join('');
}
renderPublicProjects();

// ---------- Admin modal & auth ----------
const modal = $('[data-admin-modal]');
const scrim = $('[data-modal-scrim]');
const openBtn = $('[data-admin-open]');
const closeBtn = $('[data-admin-close]');
const form = $('[data-admin-form]');
const statusEl = $('[data-admin-status]');
const dashboard = $('[data-admin-dashboard]');
const logoutBtn = $('[data-admin-logout]');

function openModal(){
  modal.setAttribute('aria-hidden','false');
  scrim.hidden = false;
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
  scrim.hidden = true;
}
if(openBtn) openBtn.addEventListener('click', openModal);
if(closeBtn) closeBtn.addEventListener('click', closeModal);
if(scrim) scrim.addEventListener('click', closeModal);

// Demo admin credentials (front-end only)
const DEMO_ADMIN = { email: 'admin@claddinginvestments.com', password: 'admin123' };

function isAuthed(){
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).authed === true : false;
  } catch { return false; }
}
function setAuthed(flag){
  localStorage.setItem(AUTH_KEY, JSON.stringify({ authed: !!flag }));
}

function showDashboard(flag){
  dashboard.hidden = !flag;
  form.hidden = flag;
}

if(form){
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if(data.email === DEMO_ADMIN.email && data.password === DEMO_ADMIN.password){
      statusEl.textContent = 'Login successful.';
      setAuthed(true);
      showDashboard(true);
      renderAdminProjects();
    } else {
      statusEl.textContent = 'Invalid credentials.';
    }
  });
}
if(logoutBtn){
  logoutBtn.addEventListener('click', () => {
    setAuthed(false);
    showDashboard(false);
    statusEl.textContent = 'Logged out.';
    setTimeout(()=> statusEl.textContent = '', 2000);
  });
}

// Restore dashboard state if already authed
if(isAuthed()){
  openModal();
  showDashboard(true);
  renderAdminProjects();
}

// ---------- Admin projects CRUD ----------
const adminList = $('[data-admin-projects]');
const projectForm = $('[data-project-form]');
const clearBtn = $('[data-project-clear]');

function renderAdminProjects(){
  if(!adminList) return;
  const list = loadProjects();
  adminList.innerHTML = list.map(p => `
    <div class="admin-item" data-id="${p.id}">
      <img src="${p.img}" alt="${p.title}">
      <div class="grow">
        <strong>${p.title}</strong>
        <p class="muted">${p.desc}</p>
      </div>
      <button class="icon-btn" data-edit="${p.id}">Edit</button>
      <button class="icon-btn" data-delete="${p.id}">Delete</button>
    </div>
  `).join('');
}

if(projectForm){
  projectForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(projectForm).entries());
    const list = loadProjects();
    const editingId = projectForm.dataset.editing;
    if(editingId){
      const idx = list.findIndex(x => x.id === editingId);
      if(idx >= 0){
        list[idx] = { id: editingId, title: data.title, img: data.img, desc: data.desc };
      }
      delete projectForm.dataset.editing;
    } else {
      list.unshift({ id: uid(), title: data.title, img: data.img, desc: data.desc });
    }
    saveProjects(list);
    projectForm.reset();
    renderAdminProjects();
    renderPublicProjects();
  });
}

if(clearBtn){
  clearBtn.addEventListener('click', () => {
    projectForm.reset();
    delete projectForm.dataset.editing;
  });
}

document.addEventListener('click', e => {
  const t = e.target;
  if(t.matches('[data-delete]')){
    const id = t.getAttribute('data-delete');
    const list = loadProjects().filter(p => p.id !== id);
    saveProjects(list);
    renderAdminProjects();
    renderPublicProjects();
  }
  if(t.matches('[data-edit]')){
    const id = t.getAttribute('data-edit');
    const p = loadProjects().find(x => x.id === id);
    if(p){
      projectForm.title.value = p.title;
      projectForm.img.value = p.img;
      projectForm.desc.value = p.desc;
      projectForm.dataset.editing = id;
    }
  }
});
