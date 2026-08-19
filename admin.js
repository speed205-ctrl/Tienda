// ================================================================
// TECNOCELL — ADMIN DASHBOARD LOGIC (Vercel + Supabase)
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ── Local State ──
    let allProducts = [];
    let selectedFile = null;
    let productToDeleteId = null;
    let currentUser = null;

    // ── DOM References ──
    const authView = document.getElementById('authView');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const authError = document.getElementById('authError');
    const btnLogout = document.getElementById('btnLogout');
    const userBadge = document.getElementById('userBadge');
    
    // Notice & Config
    const configNotice = document.getElementById('configNotice');
    const configModal = document.getElementById('configModal');
    const btnOpenConfigModal = document.getElementById('btnOpenConfigModal');
    const btnConfigKeys = document.getElementById('btnConfigKeys');
    const cfgUrl = document.getElementById('cfgUrl');
    const cfgAnon = document.getElementById('cfgAnon');
    const btnSaveConfig = document.getElementById('btnSaveConfig');

    // Stats & Filters
    const statTotal = document.getElementById('statTotal');
    const statActive = document.getElementById('statActive');
    const statFeatured = document.getElementById('statFeatured');
    const statCategories = document.getElementById('statCategories');
    const adminSearch = document.getElementById('adminSearch');
    const adminCatFilter = document.getElementById('adminCatFilter');
    const adminStatusFilter = document.getElementById('adminStatusFilter');
    const productsTableBody = document.getElementById('productsTableBody');

    // Modal Add/Edit
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnNewProduct = document.getElementById('btnNewProduct');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnSaveProduct = document.getElementById('btnSaveProduct');
    const btnSaveText = document.getElementById('btnSaveText');

    // Form inputs
    const prodId = document.getElementById('prodId');
    const prodName = document.getElementById('prodName');
    const prodCategory = document.getElementById('prodCategory');
    const prodPrice = document.getElementById('prodPrice');
    const prodActive = document.getElementById('prodActive');
    const prodFeatured = document.getElementById('prodFeatured');
    const prodDesc = document.getElementById('prodDesc');
    const prodImgUrl = document.getElementById('prodImgUrl');
    
    // File Upload
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const btnRemoveImg = document.getElementById('btnRemoveImg');

    // Delete Modal
    const deleteModal = document.getElementById('deleteModal');
    const deleteProdName = document.getElementById('deleteProdName');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');

    // Toast
    const adminToast = document.getElementById('adminToast');

    // ── Helper: Format Money ──
    const formatMoney = n => '$' + Number(n).toFixed(2);

    // ── Toast System ──
    let toastTimer = null;
    function showToast(msg) {
        adminToast.textContent = msg;
        adminToast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => adminToast.classList.remove('show'), 3000);
    }

    // ══ 1. CONFIGURACIÓN DE CREDENCIALES (LocalStorage override) ══
    function checkSavedCredentials() {
        const savedUrl = localStorage.getItem('tecnocell_sb_url');
        const savedKey = localStorage.getItem('tecnocell_sb_key');

        if (savedUrl && savedKey) {
            window.SUPABASE_CONFIG = { url: savedUrl, anonKey: savedKey };
            if (window.reinitSupabaseClient) {
                window.reinitSupabaseClient();
            }
        }

        const isReady = window.tecnoDb && window.tecnoDb.isConfigured();
        if (!isReady) {
            configNotice.classList.remove('hidden');
        } else {
            configNotice.classList.add('hidden');
        }
    }

    function openConfigModal() {
        cfgUrl.value = window.SUPABASE_CONFIG.url.includes('TU_PROYECTO') ? '' : window.SUPABASE_CONFIG.url;
        cfgAnon.value = window.SUPABASE_CONFIG.anonKey.includes('TU_ANON') ? '' : window.SUPABASE_CONFIG.anonKey;
        configModal.classList.remove('hidden');
    }

    window.closeConfigModal = () => configModal.classList.add('hidden');

    btnOpenConfigModal?.addEventListener('click', openConfigModal);
    btnConfigKeys?.addEventListener('click', openConfigModal);

    btnSaveConfig?.addEventListener('click', () => {
        const url = cfgUrl.value.trim();
        const key = cfgAnon.value.trim();
        if (!url || !key) {
            alert('Por favor ingresa URL y Anon Key válidos de Supabase.');
            return;
        }
        localStorage.setItem('tecnocell_sb_url', url);
        localStorage.setItem('tecnocell_sb_key', key);
        window.location.reload();
    });

    // ══ 2. AUTHENTICATION (SUPABASE AUTH) ══
    async function initAuth() {
        checkSavedCredentials();
        const client = window.getSupabaseClient ? window.getSupabaseClient() : null;

        if (!client) {
            // Modo demo / sin conexión configurada
            setupDemoSession();
            return;
        }

        try {
            const { data: { session } } = await client.auth.getSession();
            if (session && session.user) {
                currentUser = session.user;
                showDashboard(currentUser.email);
            } else {
                showLogin();
            }

            // Escuchar cambios de sesión
            client.auth.onAuthStateChange((event, session) => {
                if (session && session.user) {
                    currentUser = session.user;
                    showDashboard(currentUser.email);
                } else {
                    currentUser = null;
                    showLogin();
                }
            });
        } catch (err) {
            console.error('Error de Auth:', err);
            showLogin();
        }
    }

    function setupDemoSession() {
        const localAdmin = localStorage.getItem('tecnocell_demo_admin');
        if (localAdmin === 'true') {
            showDashboard('admin@tecnocell.local (Modo Local)');
        } else {
            showLogin();
        }
    }

    function showLogin() {
        authView.classList.remove('hidden');
        adminApp.classList.add('hidden');
    }

    function showDashboard(email) {
        authView.classList.add('hidden');
        adminApp.classList.remove('hidden');
        userBadge.textContent = email;
        loadProducts();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const btn = document.getElementById('btnLogin');

        authError.classList.add('hidden');
        btn.disabled = true;
        btn.innerHTML = '<span>Ingresando...</span>';

        const client = window.getSupabaseClient ? window.getSupabaseClient() : null;

        if (!client || !window.tecnoDb.isConfigured()) {
            // Fallback demo login si aún no configuró Supabase
            if (password === 'admin123' || password.length >= 6) {
                localStorage.setItem('tecnocell_demo_admin', 'true');
                showDashboard(email + ' (Modo Local)');
                showToast('Sesión iniciada (Modo Local)');
            } else {
                authError.textContent = 'Contraseña incorrecta (mínimo 6 caracteres para modo local).';
                authError.classList.remove('hidden');
            }
            btn.disabled = false;
            btn.innerHTML = '<span>Iniciar Sesión</span>';
            return;
        }

        try {
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            showToast('¡Bienvenido al panel!');
        } catch (err) {
            authError.textContent = err.message || 'Error al iniciar sesión. Revisa tu correo y contraseña.';
            authError.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>Iniciar Sesión</span>';
        }
    });

    btnLogout.addEventListener('click', async () => {
        const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
        if (client) {
            await client.auth.signOut();
        }
        localStorage.removeItem('tecnocell_demo_admin');
        showLogin();
        showToast('Sesión cerrada');
    });

    // ══ 3. PRODUCT CRUD & DATA LOADING ══
    async function loadProducts() {
        productsTableBody.innerHTML = '<tr><td colspan="7" class="loading-td">Cargando productos...</td></tr>';

        try {
            if (window.tecnoDb.isConfigured()) {
                allProducts = await window.tecnoDb.getAllProductsAdmin();
            } else {
                // Fallback a productos locales
                const local = localStorage.getItem('tecnocell_local_prods');
                if (local) {
                    allProducts = JSON.parse(local);
                } else {
                    allProducts = [
                        { id: 1, name: 'Mouse Gamer RGB X7', description: '12.000 DPI y 7 botones programables.', price: 25, category: 'pc', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1f53228d6-250e-46ac-9ea2-14de26ec8199.png', is_active: true, is_featured: false },
                        { id: 2, name: 'Teclado Mecánico RGB K550', description: 'Switches mecánicos y rueda de volumen.', price: 48, category: 'pc', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/196a9ff00-34b6-45ad-84c8-142bfa32bc91.png', is_active: true, is_featured: true },
                        { id: 3, name: 'Headset Gamer Pro H2', description: 'Sonido envolvente y micro flexible.', price: 32, category: 'pc', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1bba8861c-1ee8-4326-9ada-4f14a96ac994.png', is_active: true, is_featured: false },
                        { id: 4, name: 'Webcam Full HD 1080p', description: 'Con micrófono integrado.', price: 27, category: 'pc', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/19e60117a-b5e9-45fb-bb9a-9c00cfd2a142.png', is_active: true, is_featured: false },
                        { id: 5, name: 'Cargador Rápido 25W USB‑C', description: 'Carga rápida PD multimarca.', price: 15, category: 'tlf', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1f1634d8e-9c80-463e-b685-361b7114b879.png', is_active: true, is_featured: true },
                        { id: 6, name: 'Cable Trenzado USB‑C 2 m', description: 'Nylon reforzado y conectores de aluminio.', price: 8, category: 'tlf', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/102702188-0d43-46fa-9b2b-de888ac7db64.png', is_active: true, is_featured: false },
                        { id: 7, name: 'Power Bank 10.000 mAh', description: 'Doble salida con pantalla digital.', price: 22, category: 'tlf', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/15d36eeab-196d-4673-98ff-9fb25f94a230.png', is_active: true, is_featured: false },
                        { id: 8, name: 'Earbuds Bluetooth TWS', description: 'Control táctil y estuche de carga.', price: 18, category: 'tlf', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1ccaad71a-947d-4d26-84e6-8cc209c288b5.png', is_active: true, is_featured: false },
                        { id: 9, name: 'Deep Vita C Capsule Cream', description: 'Vitamina C + Niacinamida 5% · 55 g.', price: 35, category: 'belleza', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/116f6a03c-819a-41b6-aa3b-946b214a318f.png', is_active: true, is_featured: false },
                        { id: 10, name: 'Ácido Azelaico 10%', description: 'Fórmula iluminadora · 30 ml.', price: 20, category: 'belleza', image_url: 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1250c8c9f-9605-443b-821b-f454cb109948.png', is_active: true, is_featured: false }
                    ];
                    localStorage.setItem('tecnocell_local_prods', JSON.stringify(allProducts));
                }
            }

            updateStats();
            renderTable();
        } catch (err) {
            console.error(err);
            productsTableBody.innerHTML = `<tr><td colspan="7" class="loading-td" style="color:red">Error cargando productos: ${err.message}</td></tr>`;
        }
    }

    function updateStats() {
        const total = allProducts.length;
        const active = allProducts.filter(p => p.is_active).length;
        const featured = allProducts.filter(p => p.is_featured).length;
        const cats = new Set(allProducts.map(p => p.category)).size;

        statTotal.textContent = total;
        statActive.textContent = active;
        statFeatured.textContent = featured;
        statCategories.textContent = cats;
    }

    function renderTable() {
        const search = adminSearch.value.trim().toLowerCase();
        const catFilter = adminCatFilter.value;
        const statusFilter = adminStatusFilter.value;

        const filtered = allProducts.filter(p => {
            const matchesSearch = (p.name || '').toLowerCase().includes(search) || 
                                  (p.description || '').toLowerCase().includes(search);
            const matchesCat = (catFilter === 'all') || (p.category === catFilter);
            const matchesStatus = (statusFilter === 'all') || 
                                  (statusFilter === 'active' && p.is_active) || 
                                  (statusFilter === 'inactive' && !p.is_active);
            return matchesSearch && matchesCat && matchesStatus;
        });

        if (!filtered.length) {
            productsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-td">No se encontraron productos con los filtros seleccionados.</td>
                </tr>`;
            return;
        }

        productsTableBody.innerHTML = filtered.map(p => {
            const catClass = ['pc', 'tlf', 'belleza'].includes(p.category) ? p.category : '';
            const catLabel = p.category ? p.category.toUpperCase() : 'GENERAL';
            const img = p.image_url || 'https://via.placeholder.com/80?text=Sin+Foto';

            return `
                <tr>
                    <td>
                        <img src="${img}" alt="${p.name}" class="prod-thumb" loading="lazy">
                    </td>
                    <td>
                        <div class="prod-title">${p.name}</div>
                        <div class="prod-desc-sm">${p.description || 'Sin descripción'}</div>
                    </td>
                    <td>
                        <span class="cat-tag ${catClass}">${catLabel}</span>
                    </td>
                    <td>
                        <span class="price-text">${formatMoney(p.price)}</span>
                    </td>
                    <td>
                        <span class="status-badge ${p.is_active ? 'active' : 'inactive'}">
                            <span class="status-dot"></span>
                            ${p.is_active ? 'Activo' : 'Oculto'}
                        </span>
                    </td>
                    <td>
                        ${p.is_featured ? '<span class="star-icon" title="Destacado">★</span>' : '<span style="color:var(--line)">—</span>'}
                    </td>
                    <td class="text-right">
                        <div class="actions-cell">
                            <button class="btn-action-edit" onclick="window.editProduct(${p.id})">Editar</button>
                            <button class="btn-action-delete" onclick="window.confirmDeleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    adminSearch.addEventListener('input', renderTable);
    adminCatFilter.addEventListener('change', renderTable);
    adminStatusFilter.addEventListener('change', renderTable);

    // ══ 4. IMAGE UPLOAD & DRAG/DROP ══
    uploadZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });
    });

    uploadZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length) handleImageSelection(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleImageSelection(e.target.files[0]);
    });

    function handleImageSelection(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5MB.');
            return;
        }

        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            uploadPreview.classList.remove('hidden');
            prodImgUrl.value = ''; // Limpiar URL externa
        };
        reader.readAsDataURL(file);
    }

    btnRemoveImg.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = null;
        fileInput.value = '';
        previewImg.src = '';
        uploadPreview.classList.add('hidden');
        uploadPlaceholder.classList.remove('hidden');
    });

    prodImgUrl.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            selectedFile = null;
            previewImg.src = url;
            uploadPlaceholder.classList.add('hidden');
            uploadPreview.classList.remove('hidden');
        }
    });

    // ══ 5. MODAL AGREGAR / EDITAR ══
    function openProductModal(isEdit = false, prod = null) {
        productForm.reset();
        selectedFile = null;
        fileInput.value = '';
        uploadPreview.classList.add('hidden');
        uploadPlaceholder.classList.remove('hidden');

        if (isEdit && prod) {
            modalTitle.textContent = 'Editar Producto';
            btnSaveText.textContent = 'Guardar Cambios';
            prodId.value = prod.id;
            prodName.value = prod.name;
            prodCategory.value = prod.category || 'pc';
            prodPrice.value = prod.price;
            prodActive.checked = !!prod.is_active;
            prodFeatured.checked = !!prod.is_featured;
            prodDesc.value = prod.description || '';
            prodImgUrl.value = prod.image_url || '';

            if (prod.image_url) {
                previewImg.src = prod.image_url;
                uploadPlaceholder.classList.add('hidden');
                uploadPreview.classList.remove('hidden');
            }
        } else {
            modalTitle.textContent = 'Nuevo Producto';
            btnSaveText.textContent = 'Crear Producto';
            prodId.value = '';
            prodActive.checked = true;
            prodFeatured.checked = false;
        }

        productModal.classList.remove('hidden');
    }

    function closeProductModal() {
        productModal.classList.add('hidden');
    }

    btnNewProduct.addEventListener('click', () => openProductModal(false));
    btnCloseModal.addEventListener('click', closeProductModal);
    btnCancelModal.addEventListener('click', closeProductModal);

    window.editProduct = (id) => {
        const prod = allProducts.find(p => p.id === id);
        if (prod) openProductModal(true, prod);
    };

    // ══ 6. GUARDAR PRODUCTO (INSERT / UPDATE) ══
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSaveProduct.disabled = true;
        btnSaveText.textContent = 'Guardando...';

        try {
            let finalImageUrl = prodImgUrl.value.trim();

            // Si seleccionó un archivo nuevo y Supabase está configurado, subir al Storage
            if (selectedFile) {
                if (window.tecnoDb.isConfigured()) {
                    btnSaveText.textContent = 'Subiendo imagen...';
                    finalImageUrl = await window.tecnoDb.uploadProductImage(selectedFile);
                } else {
                    // En modo local usamos el Base64 o URL provisional
                    finalImageUrl = previewImg.src;
                }
            }

            if (!finalImageUrl) {
                finalImageUrl = 'https://image.qwenlm.ai/public_source/1310e334-0345-45b6-afbb-14b1c138cbad/1f53228d6-250e-46ac-9ea2-14de26ec8199.png';
            }

            const payload = {
                name: prodName.value.trim(),
                description: prodDesc.value.trim(),
                price: parseFloat(prodPrice.value),
                category: prodCategory.value,
                image_url: finalImageUrl,
                is_active: prodActive.checked,
                is_featured: prodFeatured.checked
            };

            const isEdit = Boolean(prodId.value);

            if (window.tecnoDb.isConfigured()) {
                if (isEdit) {
                    await window.tecnoDb.updateProduct(prodId.value, payload);
                    showToast('Producto actualizado correctamente');
                } else {
                    await window.tecnoDb.createProduct(payload);
                    showToast('Producto creado con éxito');
                }
            } else {
                // Modo local fallback
                if (isEdit) {
                    const idx = allProducts.findIndex(p => p.id === Number(prodId.value));
                    if (idx !== -1) allProducts[idx] = { ...allProducts[idx], ...payload };
                    showToast('Producto actualizado (Local)');
                } else {
                    const newId = Date.now();
                    allProducts.unshift({ id: newId, ...payload });
                    showToast('Producto creado (Local)');
                }
                localStorage.setItem('tecnocell_local_prods', JSON.stringify(allProducts));
            }

            closeProductModal();
            loadProducts();
        } catch (err) {
            console.error(err);
            alert('Error al guardar el producto: ' + err.message);
        } finally {
            btnSaveProduct.disabled = false;
            btnSaveText.textContent = 'Guardar Producto';
        }
    });

    // ══ 7. ELIMINAR PRODUCTO ══
    window.confirmDeleteProduct = (id, name) => {
        productToDeleteId = id;
        deleteProdName.textContent = `"${name}"`;
        deleteModal.classList.remove('hidden');
    };

    window.closeDeleteModal = () => {
        productToDeleteId = null;
        deleteModal.classList.add('hidden');
    };

    btnConfirmDelete.addEventListener('click', async () => {
        if (!productToDeleteId) return;
        btnConfirmDelete.disabled = true;
        btnConfirmDelete.textContent = 'Eliminando...';

        try {
            if (window.tecnoDb.isConfigured()) {
                await window.tecnoDb.deleteProduct(productToDeleteId);
                showToast('Producto eliminado');
            } else {
                allProducts = allProducts.filter(p => p.id !== productToDeleteId);
                localStorage.setItem('tecnocell_local_prods', JSON.stringify(allProducts));
                showToast('Producto eliminado (Local)');
            }

            closeDeleteModal();
            loadProducts();
        } catch (err) {
            console.error(err);
            alert('Error al eliminar: ' + err.message);
        } finally {
            btnConfirmDelete.disabled = false;
            btnConfirmDelete.textContent = 'Eliminar Definitivamente';
        }
    });

    // ── Iniciar flujo ──
    initAuth();
});
