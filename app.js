/* ══════════════════════════════════════
   TecnoCell — Storefront Logic (Supabase Dynamic Products)
   ══════════════════════════════════════ */

const WHATS = '584121585370';

const CATLABEL = {
    pc: 'PC',
    tlf: 'Teléfono',
    belleza: 'Belleza',
    otro: 'General'
};

// Fallback inicial por si no hay conexión a Supabase
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        cat: 'pc',
        price: 25,
        name: 'Mouse Gamer RGB X7',
        desc: '12.000 DPI y 7 botones programables.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1f53228d6-250e-46ac-9ea2-14de26ec8199.png'
    },
    {
        id: 2,
        cat: 'pc',
        price: 48,
        name: 'Teclado Mecánico RGB K550',
        desc: 'Switches mecánicos y rueda de volumen.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/196a9ff00-34b6-45ad-84c8-142bfa32bc91.png'
    },
    {
        id: 3,
        cat: 'pc',
        price: 32,
        name: 'Headset Gamer Pro H2',
        desc: 'Sonido envolvente y micro flexible.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1bba8861c-1ee8-4326-9ada-4f14a96ac994.png'
    },
    {
        id: 4,
        cat: 'pc',
        price: 27,
        name: 'Webcam Full HD 1080p',
        desc: 'Con micrófono integrado.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/19e60117a-b5e9-45fb-bb9a-9c00cfd2a142.png'
    },
    {
        id: 5,
        cat: 'tlf',
        price: 15,
        name: 'Cargador Rápido 25W USB‑C',
        desc: 'Carga rápida PD multimarca.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1f1634d8e-9c80-463e-b685-361b7114b879.png'
    },
    {
        id: 6,
        cat: 'tlf',
        price: 8,
        name: 'Cable Trenzado USB‑C 2 m',
        desc: 'Nylon reforzado y conectores de aluminio.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/102702188-0d43-46fa-9b2b-de888ac7db64.png'
    },
    {
        id: 7,
        cat: 'tlf',
        price: 22,
        name: 'Power Bank 10.000 mAh',
        desc: 'Doble salida con pantalla digital.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/15d36eeab-196d-4673-98ff-9fb25f94a230.png'
    },
    {
        id: 8,
        cat: 'tlf',
        price: 18,
        name: 'Earbuds Bluetooth TWS',
        desc: 'Control táctil y estuche de carga.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1ccaad71a-947d-4d26-84e6-8cc209c288b5.png'
    },
    {
        id: 9,
        cat: 'belleza',
        price: 35,
        name: 'Deep Vita C Capsule Cream',
        desc: 'Vitamina C + Niacinamida 5% · 55 g.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/116f6a03c-819a-41b6-aa3b-946b214a318f.png'
    },
    {
        id: 10,
        cat: 'belleza',
        price: 20,
        name: 'Ácido Azelaico 10%',
        desc: 'Fórmula iluminadora · 30 ml.',
        img: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1250c8c9f-9605-443b-821b-f454cb109948.png'
    }
];

let PRODUCTS = [...DEFAULT_PRODUCTS];

/* ── State ── */
let currentCat = 'all';
let cart = {};

try {
    cart = JSON.parse(localStorage.getItem('tcellCart')) || {};
} catch (e) {
    cart = {};
}

/* ── DOM References ── */
const $ = id => document.getElementById(id);
const gridEl = $('grid');
const badgeEl = $('cartCount');
const itemsEl = $('cartItems');
const totalEl = $('cartTotal');
const drawerEl = $('drawer');
const overlayEl = $('overlay');
const toastEl = $('toast');
const searchEl = $('search');

/* ── Helpers ── */
const money = n => '$' + Number(n).toFixed(2);

/* ══ CARGA DE PRODUCTOS DESDE SUPABASE ══ */
async function fetchProducts() {
    // Comprobar credenciales guardadas en localStorage
    const savedUrl = localStorage.getItem('tecnocell_sb_url');
    const savedKey = localStorage.getItem('tecnocell_sb_key');
    if (savedUrl && savedKey) {
        window.SUPABASE_CONFIG = { url: savedUrl, anonKey: savedKey };
        if (window.supabase && window.supabase.createClient) {
            window.supabaseClientInstance = window.supabase.createClient(savedUrl, savedKey);
        }
    }

    try {
        if (window.tecnoDb && window.tecnoDb.isConfigured()) {
            const data = await window.tecnoDb.getPublicProducts();
            if (data && data.length > 0) {
                PRODUCTS = data.map(item => ({
                    id: item.id,
                    cat: item.category || 'pc',
                    price: parseFloat(item.price),
                    name: item.name,
                    desc: item.description || '',
                    img: item.image_url || 'https://via.placeholder.com/400?text=TecnoCell'
                }));
            }
        } else {
            // Verificar si hay cambios en local storage del panel admin
            const localProds = localStorage.getItem('tecnocell_local_prods');
            if (localProds) {
                const parsed = JSON.parse(localProds);
                if (parsed && parsed.length > 0) {
                    PRODUCTS = parsed.filter(p => p.is_active !== false).map(item => ({
                        id: item.id,
                        cat: item.category || 'pc',
                        price: parseFloat(item.price),
                        name: item.name,
                        desc: item.description || '',
                        img: item.image_url || item.img || 'https://via.placeholder.com/400?text=TecnoCell'
                    }));
                }
            }
        }
    } catch (err) {
        console.warn('Usando catálogo fallback:', err);
    }

    renderProducts();
    syncCart();
}

/* ══ PRODUCT RENDERING ══ */
function renderProducts() {
    const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const list = PRODUCTS.filter(p =>
        (currentCat === 'all' || p.cat === currentCat) &&
        (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    );

    if (!list.length) {
        gridEl.innerHTML = '<p class="empty">No se encontraron resultados en el catálogo.</p>';
        return;
    }

    gridEl.innerHTML = list.map((p, i) => {
        const catText = CATLABEL[p.cat] || p.cat.toUpperCase();
        return `
            <article class="card" style="animation-delay:${i * 0.04}s">
                <div class="ph">
                    <img src="${p.img}" alt="${p.name}" loading="lazy">
                </div>
                <span class="cat">${catText}</span>
                <h3>${p.name}</h3>
                <p class="desc">${p.desc}</p>
                <p class="price">${money(p.price)} <span>USD</span></p>
                <button class="addB" onclick="addToCart(${p.id})">Añadir a la bolsa</button>
            </article>
        `;
    }).join('');
}

/* ══ CATEGORY FILTERS ══ */
function setCat(cat) {
    currentCat = cat;
    document.querySelectorAll('#chips button').forEach(b =>
        b.classList.toggle('active', b.dataset.cat === cat)
    );
    renderProducts();
}

function goCat(cat) {
    setCat(cat);
}

const chipsEl = $('chips');
if (chipsEl) {
    chipsEl.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (b && b.dataset.cat) setCat(b.dataset.cat);
    });
}

if (searchEl) {
    searchEl.addEventListener('input', renderProducts);
}

/* ══ CART LOGIC ══ */
function saveCart() {
    localStorage.setItem('tcellCart', JSON.stringify(cart));
}

function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    syncCart();
    showToast('Añadido a la bolsa');
}

function changeQty(id, d) {
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    saveCart();
    syncCart();
}

function removeLine(id) {
    delete cart[id];
    saveCart();
    syncCart();
}

function entries() {
    return Object.entries(cart).map(([id, qty]) => ({
        prod: PRODUCTS.find(p => String(p.id) === String(id)),
        qty
    })).filter(e => e.prod);
}

function syncCart() {
    const es = entries();
    const count = es.reduce((s, e) => s + e.qty, 0);
    const total = es.reduce((s, e) => s + e.qty * e.prod.price, 0);

    if (badgeEl) {
        badgeEl.textContent = count;
        badgeEl.classList.remove('pop');
        void badgeEl.offsetWidth;
        badgeEl.classList.add('pop');
    }

    if (totalEl) {
        totalEl.textContent = money(total);
    }

    if (!itemsEl) return;

    if (!es.length) {
        itemsEl.innerHTML = `
            <div class="dEmpty">
                <span class="ico">🛍️</span>
                <p>Tu bolsa está vacía.</p>
                <button class="btnP" onclick="closeDrawer()">Ver catálogo</button>
            </div>`;
        return;
    }

    itemsEl.innerHTML = es.map(({ prod, qty }) => `
        <div class="cItem">
            <img src="${prod.img}" alt="${prod.name}">
            <div class="cInfo">
                <h4>${prod.name}</h4>
                <p class="cp">${money(prod.price)}</p>
                <div class="stepper">
                    <button onclick="changeQty(${prod.id},-1)" aria-label="Menos">−</button>
                    <span>${qty}</span>
                    <button onclick="changeQty(${prod.id},1)" aria-label="Más">+</button>
                </div>
            </div>
            <div class="cRight">
                <strong>${money(prod.price * qty)}</strong>
                <button class="del" onclick="removeLine(${prod.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

/* ══ CHECKOUT — WhatsApp ══ */
const checkoutBtn = $('checkout');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const es = entries();

        if (!es.length) {
            showToast('Tu bolsa está vacía');
            return;
        }

        const lines = ['🛍️ *NUEVO PEDIDO — TECNOCELL*', '──────────────────'];
        let total = 0;

        es.forEach(({ prod, qty }) => {
            const sub = prod.price * qty;
            total += sub;
            lines.push('▪ ' + prod.name + '  x' + qty + '  →  ' + money(sub));
        });

        lines.push(
            '──────────────────',
            '*TOTAL: ' + money(total) + '*',
            '',
            'Quedo atento para coordinar pago y envío 🙂'
        );

        window.open(
            'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(lines.join('\n')),
            '_blank'
        );
    });
}

/* ══ DRAWER (Cart panel) ══ */
function openDrawer() {
    if (drawerEl && overlayEl) {
        drawerEl.classList.add('show');
        overlayEl.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeDrawer() {
    if (drawerEl && overlayEl) {
        drawerEl.classList.remove('show');
        overlayEl.classList.remove('show');
        document.body.style.overflow = '';
    }
}

const openCartBtn = $('openCart');
const closeCartBtn = $('closeCart');

if (openCartBtn) openCartBtn.addEventListener('click', openDrawer);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeDrawer);
if (overlayEl) overlayEl.addEventListener('click', closeDrawer);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
});

/* ══ TOAST ══ */
let toastT = null;
function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

/* ══ SCROLL REVEAL ══ */
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
        e.target.classList.add('on');
        io.unobserve(e.target);
    }
}), { threshold: .12 });

document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});
