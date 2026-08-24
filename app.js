/* ══════════════════════════════════════
   TecnoCell — Storefront Logic (Supabase Dynamic Products)
   ══════════════════════════════════════ */

const WHATS = '584121585370';

const CATLABEL = {
    cargadores: 'Carga y Cables',
    audio: 'AirPods',
    watch: 'Apple Watch',
    magsafe: 'MagSafe',
    tlf: 'Teléfono',
    otro: 'General'
};

// Fallback inicial por si no hay conexión a Supabase
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        cat: 'cargadores',
        price: 25,
        name: 'Cargador Completo 20W (Cubo + Cable)',
        desc: 'Kit de carga rápida con adaptador USB-C de 20W y cable de alta velocidad. Carga hasta un 50% de batería en 30 minutos.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHJA3?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 2,
        cat: 'cargadores',
        price: 45,
        name: 'Cargador Completo Dual USB-C 35W + Cable',
        desc: 'Adaptador de corriente compacto con doble puerto USB-C de 35W y cable reforzado. Carga dos dispositivos en simultáneo.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MNWM3?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 3,
        cat: 'cargadores',
        price: 35,
        name: 'Cargador Rápido 50W Doble Puerto GaN',
        desc: 'Potente cargador ultrarrápido de 50W con tecnología GaN y dos salidas inteligentes (USB-C + USB-A) para laptops y celulares.',
        img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80'
    },
    {
        id: 4,
        cat: 'cargadores',
        price: 8,
        name: 'Cable USB-A a USB-C Alta Resistencia',
        desc: 'Cable de carga y sincronización ultrarresistente con conectores reforzados antidoblado y recubrimiento duradero.',
        img: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1000&q=80'
    },
    {
        id: 5,
        cat: 'cargadores',
        price: 12,
        name: 'Cable USB-A a Lightning Clásico (1 m)',
        desc: 'Cable de 1 metro para conexión y sincronización estable de iPhone, iPad y estuches de AirPods.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MXLY2?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 6,
        cat: 'cargadores',
        price: 19,
        name: 'Cable USB-C a USB-C Trenzado 60W (1 m)',
        desc: 'Cable con recubrimiento de tejido trenzado. Compatible con Power Delivery de 60W para carga ultra rápida.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQKJ3?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 7,
        cat: 'audio',
        price: 99,
        name: 'Apple AirPods (2.ª Generación)',
        desc: 'Auriculares inalámbricos con chip H1 de conexión veloz, activación por voz con Siri y más de 24 horas de autonomía.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MV7N2?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 8,
        cat: 'audio',
        price: 149,
        name: 'Apple AirPods (3.ª Generación)',
        desc: 'Audio espacial con seguimiento dinámico de la cabeza, ecualización adaptativa, resistencia IPX4 y estuche MagSafe.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 9,
        cat: 'audio',
        price: 499,
        name: 'Apple AirPods Max',
        desc: 'Auriculares over-ear de alta fidelidad con cancelación activa de ruido profesional, modo ambiente y almohadillas acústicas.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-spacegray-202011?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 10,
        cat: 'watch',
        price: 399,
        name: 'Apple Watch Series 10',
        desc: 'Diseño ultradelgado con pantalla OLED de amplio ángulo, monitor de ECG, oxígeno en sangre y carga rápida magnética.',
        img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80'
    },
    {
        id: 11,
        cat: 'watch',
        price: 799,
        name: 'Apple Watch Ultra 2',
        desc: 'Smartwatch premium con caja de titanio aeroespacial de 49 mm, pantalla de 3000 nits, GPS dual y batería de hasta 72h.',
        img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'
    },
    {
        id: 12,
        cat: 'magsafe',
        price: 89,
        name: 'Apple MagSafe Battery Pack',
        desc: 'Batería portátil magnética inalámbrica que se acopla a la perfección a tu iPhone para proporcionar carga automática y segura.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MJWY3?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 13,
        cat: 'magsafe',
        price: 39,
        name: 'Power Bank Magnético MagSafe Pro con Soporte',
        desc: 'Batería inalámbrica magnética de 10.000 mAh con pata de apoyo abatible integrada, imanes fuertes y puerto USB-C bidireccional.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MJWY3_AV2?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 14,
        cat: 'magsafe',
        price: 35,
        name: 'Billetera MagSafe de Cuero para iPhone',
        desc: 'Tarjetero de cuero genuino con potentes imanes integrados, protección electromagnética y compatibilidad con la red Buscar.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MM0Y3?wid=1000&hei=1000&fmt=jpeg&qlt=95'
    },
    {
        id: 15,
        cat: 'magsafe',
        price: 29,
        name: 'Billetera MagSafe FineWoven para iPhone',
        desc: 'Tarjetero magnético en microtwill ecológico FineWoven de tacto suave. Capacidad para 3 tarjetas y soporte Find My.',
        img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT243?wid=1000&hei=1000&fmt=jpeg&qlt=95'
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
                if (parsed && parsed.length >= DEFAULT_PRODUCTS.length) {
                    PRODUCTS = parsed.filter(p => p.is_active !== false).map(item => ({
                        id: item.id,
                        cat: item.category || 'pc',
                        price: parseFloat(item.price),
                        name: item.name,
                        desc: item.description || '',
                        img: item.image_url || item.img || 'https://via.placeholder.com/400?text=TecnoCell'
                    }));
                } else {
                    PRODUCTS = [...DEFAULT_PRODUCTS];
                    localStorage.removeItem('tecnocell_local_prods');
                }
            } else {
                PRODUCTS = [...DEFAULT_PRODUCTS];
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
