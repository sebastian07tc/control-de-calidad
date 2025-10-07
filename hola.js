
const GALLERY_IMAGES = [
  '1984.jpg',
  'A DOS METROS DE TI.jpg',
  'Camuñas.jpg',
  'COCINA CON MARIA.webp',
  'CODIGO DA VINCI.webp',
  'COMO GANAR AMIGOS E INFLUIR SOBRE LAS PERSONAS.jpeg',
  'DEJA DE SER TU.jpg',
  'DESARROLLO HUMANO.jpeg',
  'DON QUIJOTE.jpg',
  'EL PODER DE CONFIAR EN TI.jpg',
  'EL PRINCIPITO.webp',
  'ESTE DOLOR NO ES MI.jpg',
  'FORTALECE TU CARACTER.jpg',
  'FRANKENSTEIN.jpg',
  'HABITOS ATOMICOS.jpg',
  'LA CASA EN EL CONFIN DE LA TIERRA.jpeg',
  'LA DISCIPLINA MARCARA TU DESTINO.webp',
  'la parabola de pablo.webp',
  'LO QUE EL BOSQUE ESCONDE.webp',
  'LOS CUATRO ACUERDOS.jpg',
  'MAMA NOS DIJO ADIOS.jpg',
  'PADRE RICO,PADRE POBRE.jpeg',
  'PSICOLOGIA OSCURA.jpg',
  'SI LO CREES, LO CREAS.jpg',
  'TODO SOBRE EL CANNABIS.webp',
  'TUS ZONAS ERRONEAS.jpg'
];

function el(sel){return document.querySelector(sel)}

// Resuelve la ruta real de la imagen de forma sencilla:
// si el nombre ya contiene 'img/' lo deja, si no lo prefija con 'img/'.
// Usamos métodos básicos (indexOf) para mantenerlo simple.
function resolveImagePath(src){
  if(!src) return '';
  const s = String(src);
  // si ya es una data URI, una URL absoluta (http/https) o empieza por '/' o ya contiene img/, la usamos tal cual
  if (s.indexOf('data:') === 0) return s;
  if (s.indexOf('http://') === 0 || s.indexOf('https://') === 0) return s;
  if (s.indexOf('/') === 0) return s;
  if (s.indexOf('img/') === 0) return s;
  // en otros casos asumimos que es un nombre de archivo dentro de img/
  return 'img/' + s;
}

// Placeholder simple (data URL SVG) para fallos de carga
const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="100%" height="100%" fill="#eef2ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8">No image</text></svg>');

// Migración simple: si hay reseñas guardadas con image sin prefijo 'img/',
// las actualizamos una sola vez al cargar la página.
function migrateSavedImages(){
  try{
    const raw = localStorage.getItem('book_reviews');
    if(!raw) return;
    const arr = JSON.parse(raw);
    let changed = false;
    for(let i=0;i<arr.length;i++){
      const img = arr[i].image || '';
      if(img && String(img).indexOf('img/') !== 0){
        arr[i].image = 'img/' + img;
        changed = true;
      }
    }
    if(changed){ localStorage.setItem('book_reviews', JSON.stringify(arr)); }
  }catch(e){ /* si falla la migración, no hacemos nada */ }
}

function loadGallery(){
  const g = el('#gallery'); g.innerHTML = '';
  GALLERY_IMAGES.forEach(src=>{
    const d = document.createElement('div'); d.className='thumb';
    const img = document.createElement('img'); img.src = resolveImagePath(src); img.alt=src; img.onerror = function(){ this.src = IMAGE_PLACEHOLDER };
    const lbl = document.createElement('div'); lbl.className='label'; lbl.textContent = src;
    // info bar (title + avg rating)
    const info = document.createElement('div'); info.className = 'info-bar';
    const title = document.createElement('div'); title.className = 'title'; title.textContent = src;
    const ratingBadge = document.createElement('div'); ratingBadge.className = 'rating'; ratingBadge.textContent = '';
    info.appendChild(title); info.appendChild(ratingBadge);
    d.appendChild(img); d.appendChild(lbl);
    d.appendChild(info);
    d.addEventListener('click', ()=> onImageClick(src));
    g.appendChild(d);
  });
}

// Devuelve un mapa { imageName: averageRating }
function computeAverageRatings(){
  const reviews = JSON.parse(localStorage.getItem('book_reviews')||'[]');
  const map = {};
  reviews.forEach(r=>{
    const key = r.image || '';
    if(!key) return;
    if(!map[key]) map[key] = { sum:0, count:0 };
    map[key].sum += Number(r.rating)||0; map[key].count += 1;
  });
  const out = {};
  Object.keys(map).forEach(k=>{ out[k] = Math.round((map[k].sum / map[k].count) * 10) / 10; });
  return out;
}

// Filtra y ordena la lista de imágenes según search y sort.
function getFilteredAndSortedImages(){
  const q = (el('#lib-search') && el('#lib-search').value || '').toLowerCase().trim();
  const sort = (el('#lib-sort') && el('#lib-sort').value) || 'none';
  const avg = computeAverageRatings();
  let arr = GALLERY_IMAGES.slice();
  if(q){ arr = arr.filter(x => String(x).toLowerCase().indexOf(q) !== -1); }
  if(sort === 'name-asc') arr.sort((a,b)=> a.localeCompare(b));
  if(sort === 'name-desc') arr.sort((a,b)=> b.localeCompare(a));
  if(sort === 'rating-desc') arr.sort((a,b)=> (avg[b]||0) - (avg[a]||0));
  if(sort === 'rating-asc') arr.sort((a,b)=> (avg[a]||0) - (avg[b]||0));
  return { list: arr, avg };
}

// Re-render gallery using filtering/sorting and write avg rating into each thumb badge
function renderGalleryWithControls(){
  const g = el('#gallery'); g.innerHTML = '';
  const res = getFilteredAndSortedImages();
  res.list.forEach(src=>{
    const d = document.createElement('div'); d.className='thumb';
    const img = document.createElement('img'); img.src = resolveImagePath(src); img.alt=src; img.onerror = function(){ this.src = IMAGE_PLACEHOLDER };
    const lbl = document.createElement('div'); lbl.className='label'; lbl.textContent = src;
    const info = document.createElement('div'); info.className = 'info-bar';
    const title = document.createElement('div'); title.className = 'title'; title.textContent = src;
    const ratingBadge = document.createElement('div'); ratingBadge.className = 'rating'; ratingBadge.textContent = (res.avg[src] ? res.avg[src] + '★' : '—');
    info.appendChild(title); info.appendChild(ratingBadge);
    d.appendChild(img); d.appendChild(lbl); d.appendChild(info);
    d.addEventListener('click', ()=> onImageClick(src));
    g.appendChild(d);
  });
}

let currentImageForReview = null;
function onImageClick(src){
  currentImageForReview = src;
 
  el('#br-img').src = resolveImagePath(src); el('#br-author').value = '';
  el('#br-text').value = '';
  setStars(5);
  showModal();
}

function showModal(){
  const m = el('#review-modal'); if(!m) return;
  m.classList.remove('hidden'); m.setAttribute('aria-hidden','false');
}
function hideModal(){
  const m = el('#review-modal'); if(!m) return;
  m.classList.add('hidden'); m.setAttribute('aria-hidden','true');
}

function setStars(n){
  const stars = Array.from(document.querySelectorAll('#br-stars span'));
  stars.forEach(s=>{
    const v = Number(s.getAttribute('data-star'));
    s.classList.toggle('selected', v<=n);
  });
  document.getElementById('br-stars').setAttribute('data-value', String(n));
}

function renderSavedReviews(){
  const ul = el('#saved-reviews'); ul.innerHTML='';
  const reviews = JSON.parse(localStorage.getItem('book_reviews')||'[]');
  reviews.forEach(r=>{
    const li = document.createElement('li');
    // thumbnail
  const img = document.createElement('img'); img.src = resolveImagePath(r.image); img.alt = r.image; img.className = 'rev-thumb'; img.onerror = function(){ this.src = IMAGE_PLACEHOLDER };
    // body
    const body = document.createElement('div'); body.className = 'rev-body';
    const title = document.createElement('div'); title.className = 'rev-title'; title.textContent = r.author || 'Anónimo';
    const meta = document.createElement('div'); meta.className = 'rev-meta'; meta.textContent = `${r.rating} ★ · ${new Date(r.createdAt).toLocaleString()}`;
    const text = document.createElement('div'); text.className = 'rev-text'; text.textContent = r.text || '';
    body.appendChild(title); body.appendChild(meta); body.appendChild(text);
    li.appendChild(img); li.appendChild(body);
    ul.appendChild(li);
  });
}

// Render the list of user-added books with delete controls
function renderUserBooks(){
  const ul = el('#user-books-list'); if(!ul) return; ul.innerHTML = '';
  const users = JSON.parse(localStorage.getItem('user_books')||'[]');
  users.forEach(b=>{
    const li = document.createElement('li');
    const img = document.createElement('img'); img.src = resolveImagePath(b.image); img.alt = b.title || b.image; img.className = 'ub-thumb'; img.onerror = function(){ this.src = IMAGE_PLACEHOLDER };
    const info = document.createElement('div'); info.style.width = '220px';
    const t = document.createElement('div'); t.className = 'ub-title'; t.textContent = b.title || 'Sin título';
    const a = document.createElement('div'); a.className = 'ub-author'; a.textContent = b.author ? b.author : ''; a.style.color = 'var(--muted)'; a.style.fontSize = '0.9rem';
    info.appendChild(t); info.appendChild(a);
    const actions = document.createElement('div'); actions.className = 'ub-actions';
    const del = document.createElement('button'); del.className = 'btn ghost'; del.textContent = 'Borrar';
    del.addEventListener('click', ()=>{ if(!confirm('Borrar este libro?')) return; deleteUserBook(b.id); });
    actions.appendChild(del);
    li.appendChild(img); li.appendChild(info); li.appendChild(actions);
    ul.appendChild(li);
  });
}

function deleteUserBook(id){
  const users = JSON.parse(localStorage.getItem('user_books')||'[]');
  const idx = users.findIndex(x=> x.id === id);
  if(idx === -1) return;
  const book = users[idx];
  users.splice(idx,1);
  localStorage.setItem('user_books', JSON.stringify(users));
  // remove one occurrence of the image from GALLERY_IMAGES
  const gi = GALLERY_IMAGES.findIndex(x=> x === book.image);
  if(gi !== -1) GALLERY_IMAGES.splice(gi,1);
  populateImageSelect(); renderGalleryWithControls(); renderUserBooks();
}

function clearAllUserBooks(){
  if(!confirm('Borrar todos los libros añadidos?')) return;
  // remove user books and their images from gallery
  const users = JSON.parse(localStorage.getItem('user_books')||'[]');
  const images = users.map(u=> u.image);
  const remaining = GALLERY_IMAGES.filter(x=> images.indexOf(x) === -1);
  localStorage.removeItem('user_books');
  GALLERY_IMAGES.length = 0; GALLERY_IMAGES.push.apply(GALLERY_IMAGES, remaining);
  populateImageSelect(); renderGalleryWithControls(); renderUserBooks();
}

function clearReviews(){ if(!confirm('Borrar todas las reseñas?')) return; localStorage.removeItem('book_reviews'); renderSavedReviews(); }

// wiring modal and stars
function setupModalHandlers(){
  // stars hover and click
  const stars = document.querySelectorAll('#br-stars span');
  stars.forEach(s=>{
    s.addEventListener('mouseover', (e)=>{
      const v = Number(e.target.getAttribute('data-star'));
      const list = Array.from(stars);
      list.forEach(x=> x.classList.toggle('hover', Number(x.getAttribute('data-star'))<=v));
    });
    s.addEventListener('mouseout', ()=>{ stars.forEach(x=> x.classList.remove('hover')); });
    s.addEventListener('click', (e)=>{ setStars(Number(e.target.getAttribute('data-star'))); });
  });

  // save & cancel
  el('#br-save').addEventListener('click', ()=>{
    const author = el('#br-author').value.trim() || 'Anónimo';
    const rating = Number(el('#br-stars').getAttribute('data-value') || '5');
    const text = el('#br-text').value.trim();
    const reviews = JSON.parse(localStorage.getItem('book_reviews')||'[]');
    reviews.push({ id:'r-'+Date.now(), image: currentImageForReview, author, rating, text, createdAt: new Date().toISOString() });
    localStorage.setItem('book_reviews', JSON.stringify(reviews));
    renderSavedReviews(); hideModal();
  });
  el('#br-cancel').addEventListener('click', ()=> hideModal());
  el('#br-close').addEventListener('click', ()=> hideModal());
}

// populate image select and add button handler
function populateImageSelect(){
  const sel = el('#br-image-select');
  if (!sel) return;
  sel.innerHTML = '';
  // include user added books first
  const users = JSON.parse(localStorage.getItem('user_books')||'[]');
  users.forEach(u=>{
    const opt = document.createElement('option'); opt.value = u.image; opt.textContent = u.title || u.image;
    sel.appendChild(opt);
  });
  GALLERY_IMAGES.forEach(src=>{
    const opt = document.createElement('option'); opt.value = src; opt.textContent = src;
    sel.appendChild(opt);
  });
  // when user changes select, update cover preview
  sel.addEventListener('change', (e)=>{
    const img = el('#br-img'); if(!img) return; img.src = resolveImagePath(e.target.value);
  });
}

// Add book form handling: supports file upload (data URL) or an image URL
function setupAddBookForm(){
  const form = el('#add-book-form'); if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const title = (el('#ab-title').value||'').trim();
    if(!title) return alert('El título es requerido');
    const author = (el('#ab-author').value||'').trim();
    const url = (el('#ab-url').value||'').trim();
    const fileInput = el('#ab-file');
    const users = JSON.parse(localStorage.getItem('user_books')||'[]');

    // helper to finalize save
    function finalize(imageSrc){
      const book = { id: 'b-'+Date.now(), title, author, image: imageSrc };
      users.push(book);
      localStorage.setItem('user_books', JSON.stringify(users));
      // add to GALLERY_IMAGES so appears in gallery
      GALLERY_IMAGES.unshift(book.image);
      populateImageSelect(); renderGalleryWithControls();
      form.reset();
    }

    // if file provided, read as data URL
    if(fileInput && fileInput.files && fileInput.files[0]){
      const f = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function(ev){ finalize(ev.target.result); };
      reader.readAsDataURL(f);
      return;
    }

    // otherwise use URL if provided, else fallback to a placeholder
    if(url){ finalize(url); return; }
    // fallback: use a very small placeholder SVG data URL
    const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="100%" height="100%" fill="#eef2ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8">No image</text></svg>');
    finalize(placeholder);
  });
}

window.addEventListener('DOMContentLoaded', ()=>{ 
  migrateSavedImages(); renderSavedReviews();
  renderGalleryWithControls();
  const clearBtn = el('#clear-reviews'); if (clearBtn) clearBtn.addEventListener('click', clearReviews);
  setupModalHandlers();
  populateImageSelect();
  const addBtn = el('#add-review');
  if (addBtn){
    addBtn.addEventListener('click', ()=>{
      const sel = el('#br-image-select');
      const src = sel ? sel.value : GALLERY_IMAGES[0];
      currentImageForReview = src;
      el('#br-img').src = resolveImagePath(src); el('#br-author').value = ''; el('#br-text').value = '';
      setStars(5); showModal();
    });
  }

  // listeners for library controls
  const search = el('#lib-search'); if(search){ search.addEventListener('input', renderGalleryWithControls); }
  const sort = el('#lib-sort'); if(sort){ sort.addEventListener('change', renderGalleryWithControls); }
  // setup add book form
  setupAddBookForm();
  // render user books list and wire delete-all
  renderUserBooks();
  const ubClear = el('#ub-clear-all'); if(ubClear) ubClear.addEventListener('click', clearAllUserBooks);
});
