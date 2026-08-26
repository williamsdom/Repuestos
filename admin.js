// ====================== SISTEMA DE LOGIN ======================

const ADMIN_CREDENTIALS = {
    user: 'admin',
    pass: 'admin123'
};

function checkLogin() {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        setTimeout(initAdmin, 100);
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginError');
    
    if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        errorEl.textContent = '';
        checkLogin();
    } else {
        errorEl.textContent = '❌ Usuario o contraseña incorrectos';
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    sessionStorage.removeItem('adminLoggedIn');
    checkLogin();
});

// ====================== ADMIN FUNCTIONS ======================

let editingId = null;

function initAdmin() {
    console.log('🔧 Inicializando admin...');
    loadCategoriesUI();
    loadCategoriesSelect();
    renderAdminProducts();
    setupImageUpload();
}

// ====================== GESTIÓN DE CATEGORÍAS ======================

function loadCategoriesUI() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    
    const categories = getCategories();
    if (categories.length === 0) {
        container.innerHTML = '<span style="color: #718096;">No hay categorías</span>';
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <span class="category-tag">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            <button class="remove-category" onclick="removeCategory('${cat}')">×</button>
        </span>
    `).join('');
}

function loadCategoriesSelect() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    const categories = getCategories();
    if (categories.length === 0) {
        select.innerHTML = '<option value="">No hay categorías</option>';
        return;
    }
    
    select.innerHTML = categories.map(cat => `
        <option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
    `).join('');
}

window.removeCategory = function(category) {
    if (!confirm(`¿Eliminar la categoría "${category}"?`)) return;
    
    let categories = getCategories();
    categories = categories.filter(c => c !== category);
    saveCategories(categories);
    loadCategoriesUI();
    loadCategoriesSelect();
    if (typeof loadCategoriesFilter === 'function') loadCategoriesFilter();
    if (typeof renderProducts === 'function') renderProducts();
    showNotification(`🗑️ Categoría "${category}" eliminada`);
};

document.getElementById('addCategoryBtn')?.addEventListener('click', function() {
    const input = document.getElementById('newCategoryName');
    const name = input.value.trim().toLowerCase();
    
    if (!name) {
        alert('Ingresa un nombre para la categoría');
        return;
    }
    
    let categories = getCategories();
    if (categories.includes(name)) {
        alert('Esta categoría ya existe');
        return;
    }
    
    categories.push(name);
    saveCategories(categories);
    loadCategoriesUI();
    loadCategoriesSelect();
    if (typeof loadCategoriesFilter === 'function') loadCategoriesFilter();
    if (typeof renderProducts === 'function') renderProducts();
    input.value = '';
    showNotification(`✅ Categoría "${name}" agregada`);
});

// ====================== SUBIDA DE IMÁGENES ======================

function setupImageUpload() {
    const fileInput = document.getElementById('imageFile');
    const urlInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = this.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona una imagen válida');
                this.value = '';
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                alert('La imagen es demasiado grande. Máximo 2MB');
                this.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = e.target.result;
                if (urlInput) {
                    urlInput.value = imageData;
                }
                if (preview) {
                    preview.innerHTML = `<img src="${imageData}" alt="Vista previa">`;
                }
            };
            reader.readAsDataURL(file);
        });
    }
    
    if (urlInput) {
        urlInput.addEventListener('input', function() {
            if (preview) {
                if (this.value) {
                    preview.innerHTML = `<img src="${this.value}" alt="Vista previa">`;
                } else {
                    preview.innerHTML = '';
                }
            }
        });
    }
}

// ====================== CRUD DE PRODUCTOS ======================

function renderAdminProducts() {
    const grid = document.getElementById('adminProductsGrid');
    if (!grid) return;
    
    const products = getProducts();
    const countEl = document.getElementById('productCount');
    if (countEl) {
        countEl.textContent = `${products.length} productos`;
    }

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1;">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">📦</span>
                <h2>No hay productos</h2>
                <p>Agrega tu primer producto usando el formulario</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="admin-product-card">
            <img src="${product.image}" alt="${product.name}" class="admin-product-image">
            <div class="admin-product-info">
                <div class="admin-product-name">${product.name}</div>
                <div class="admin-product-price">$${product.price.toFixed(2)} USD</div>
                <div class="admin-product-category">${getCategoryName(product.category)}</div>
                <div class="admin-product-store">🏪 ${product.storeName || 'Sin local'}</div>
                <div class="admin-product-address">📍 ${product.address}</div>
                <div class="admin-product-phone">📞 ${product.phone}</div>
            </div>
            <div class="admin-product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">✏️ Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Editar producto
window.editProduct = function(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = id;
    document.getElementById('formTitle').textContent = '✏️ Editar Producto';
    document.getElementById('saveBtn').textContent = '💾 Actualizar Producto';
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productAddress').value = product.address;
    document.getElementById('productPhone').value = product.phone;
    document.getElementById('productStoreName').value = product.storeName || '';
    
    const preview = document.getElementById('imagePreview');
    if (preview && product.image) {
        preview.innerHTML = `<img src="${product.image}" alt="Vista previa">`;
    }
    
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
};

// Eliminar producto
window.deleteProduct = function(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    saveProducts(products);
    renderAdminProducts();
    if (typeof renderProducts === 'function') renderProducts();
    showNotification('✅ Producto eliminado correctamente');
};

// ====================== MANEJAR FORMULARIO ======================

document.getElementById('productForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value.trim();
    const address = document.getElementById('productAddress').value.trim();
    const phone = document.getElementById('productPhone').value.trim();
    const storeName = document.getElementById('productStoreName').value.trim();

    if (!name || !price || !category || !image || !address || !phone || !storeName) {
        alert('Por favor, completa todos los campos');
        return;
    }

    if (price <= 0) {
        alert('El precio debe ser mayor a 0');
        return;
    }

    let products = getProducts();

    if (id) {
        // Editar
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { ...products[index], name, price, category, image, address, phone, storeName };
            saveProducts(products);
            showNotification('✅ Producto actualizado correctamente');
        }
    } else {
        // Nuevo
        const newProduct = {
            id: generateId(),
            name,
            price,
            category,
            image,
            address,
            phone,
            storeName
        };
        products.push(newProduct);
        saveProducts(products);
        showNotification('✅ Producto agregado correctamente');
    }

    // Resetear formulario
    this.reset();
    document.getElementById('productId').value = '';
    document.getElementById('formTitle').textContent = '➕ Agregar Nuevo Producto';
    document.getElementById('saveBtn').textContent = '💾 Guardar Producto';
    document.getElementById('imagePreview').innerHTML = '';
    editingId = null;

    renderAdminProducts();
    if (typeof renderProducts === 'function') renderProducts();
});

// Botón cancelar
document.getElementById('cancelBtn')?.addEventListener('click', function() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('formTitle').textContent = '➕ Agregar Nuevo Producto';
    document.getElementById('saveBtn').textContent = '💾 Guardar Producto';
    document.getElementById('imagePreview').innerHTML = '';
    editingId = null;
});

// ====================== RESTAURAR PRODUCTOS ======================

document.getElementById('resetProductsBtn')?.addEventListener('click', function() {
    if (!confirm('⚠️ Esto eliminará todos los productos personalizados y restaurará los productos por defecto. ¿Continuar?')) return;
    
    localStorage.removeItem('autoShopProducts');
    const defaultProducts = getProducts();
    saveProducts(defaultProducts);
    renderAdminProducts();
    if (typeof renderProducts === 'function') renderProducts();
    showNotification('🔄 Productos restaurados a los valores por defecto');
});

// ====================== NOTIFICACIONES ======================

function showNotification(message) {
    // Eliminar notificaciones anteriores
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #48bb78;
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(72, 187, 120, 0.3);
        animation: slideIn 0.5s ease;
        z-index: 9999;
        max-width: 90%;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification) {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 3000);
}

// ====================== INICIALIZACIÓN ======================

checkLogin();
console.log('🔧 Panel de administración cargado');
