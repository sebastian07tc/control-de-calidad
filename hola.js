
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

function loadGallery(){
  const g = el('#gallery'); g.innerHTML = '';
  GALLERY_IMAGES.forEach(src=>{
    const d = document.createElement('div'); d.className='thumb';
    const img = document.createElement('img'); img.src=src; img.alt=src;
    const lbl = document.createElement('div'); lbl.className='label'; lbl.textContent = src;
    d.appendChild(img); d.appendChild(lbl);
    d.addEventListener('click', ()=> onImageClick(src));
    g.appendChild(d);
  });
}

let currentImageForReview = null;
function onImageClick(src){
  currentImageForReview = src;
 
  el('#br-img').src = encodeURI(src); el('#br-author').value = '';
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
    const img = document.createElement('img'); img.src = encodeURI(r.image); img.alt = r.image; img.className = 'rev-thumb';
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
  GALLERY_IMAGES.forEach(src=>{
    const opt = document.createElement('option'); opt.value = src; opt.textContent = src;
    sel.appendChild(opt);
  });
  // when user changes select, update cover preview
  sel.addEventListener('change', (e)=>{
    const img = el('#br-img'); if(!img) return; img.src = encodeURI(e.target.value);
  });
}

window.addEventListener('DOMContentLoaded', ()=>{ 
  loadGallery(); renderSavedReviews(); 
  const clearBtn = el('#clear-reviews'); if (clearBtn) clearBtn.addEventListener('click', clearReviews);
  setupModalHandlers();
  populateImageSelect();
  const addBtn = el('#add-review');
  if (addBtn){
    addBtn.addEventListener('click', ()=>{
      const sel = el('#br-image-select');
      const src = sel ? sel.value : GALLERY_IMAGES[0];
      currentImageForReview = src;
      el('#br-img').src = src; el('#br-author').value = ''; el('#br-text').value = '';
      setStars(5); showModal();
    });
  }
});
