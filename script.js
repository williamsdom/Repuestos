// ====================== DATOS Y ALMACENAMIENTO ======================

// Obtener categorías
function getCategories() {
    const stored = localStorage.getItem('autoShopCategories');
    if (stored) {
        return JSON.parse(stored);
    }
    const defaultCategories = ['motor', 'frenos', 'suspension', 'electrico', 'transmision'];
    localStorage.setItem('autoShopCategories', JSON.stringify(defaultCategories));
    return defaultCategories;
}

// Guardar categorías
function saveCategories(categories) {
    localStorage.setItem('autoShopCategories', JSON.stringify(categories));
}

// Obtener productos
function getProducts() {
    const stored = localStorage.getItem('autoShopProducts');
    if (stored) {
        const products = JSON.parse(stored);
        // Verificar que los productos tengan el campo storeName
        const hasStoreName = products.some(p => p.storeName !== undefined);
        if (!hasStoreName) {
            const updatedProducts = products.map(p => ({
                ...p,
                storeName: p.storeName || 'AutoShop Repuestos'
            }));
            saveProducts(updatedProducts);
            return updatedProducts;
        }
        return products;
    }
    const defaultProducts = [
        {
            id: 1,
            name: "Filtro de Aire K&N",
            price: 45.99,
            category: "motor",
            image: "https://placehold.co/600x400/667eea/white?text=Filtro+de+Aire",
            address: "Av. Principal 123, Local 5, Santiago",
            phone: "+56912345678",
            storeName: "AutoShop Centro"
        },
        {
            id: 2,
            name: "Pastillas de Freno Brembo",
            price: 89.50,
            category: "frenos",
            image: "https://placehold.co/600x400/764ba2/white?text=Pastillas+Freno",
            address: "Calle Los Robles 456, Centro, Valparaíso",
            phone: "+56987654321",
            storeName: "Frenos Express"
        },
        {
            id: 3,
            name: "Amortiguadores KYB",
            price: 120.00,
            category: "suspension",
            image: "https://placehold.co/600x400/48bb78/white?text=Amortiguadores",
            address: "Av. Los Leones 789, Local 12, Concepción",
            phone: "+56923456789",
            storeName: "Suspensión Total"
        },
        {
            id: 4,
            name: "Batería Bosch S5",
            price: 210.75,
            category: "electrico",
            image: "https://placehold.co/600x400/ed8936/white?text=Batería+Bosch",
            address: "Calle Carmen 321, La Serena",
            phone: "+56934567890",
            storeName: "Baterías del Norte"
        },
        {
            id: 5,
            name: "Embrague LUK",
            price: 340.00,
            category: "transmision",
            image: "https://placehold.co/600x400/e53e3e/white?text=Embrague+LUK",
            address: "Av. Libertad 567, Local 8, Rancagua",
            phone: "+56945678901",
            storeName: "Transmisiones Rancagua"
        },
        {
            id: 6,
            name: "Bujías NGK (4 unidades)",
            price: 28.99,
            category: "motor",
            image: "https://placehold.co/600x400/3182ce/white?text=Bujías+NGK",
            address: "Calle San Martín 234, Temuco",
            phone: "+56956789012",
            storeName: "Motor Parts Temuco"
        }
    ];
    localStorage.setItem('autoShopProducts', JSON.stringify(defaultProducts));
    return defaultProducts;
}

// Guardar productos
function saveProducts(products) {
    localStorage.setItem('autoShopProducts', JSON.stringify(products));
}

// Generar ID único
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Obtener nombre de categoría
function getCategoryName(category) {
    const categories = {
        'motor': '⚙️ Motor',
        'frenos': '🛑 Frenos',
        'suspension': '🔧 Suspensión',
        'electrico': '⚡ Eléctrico',
        'transmision': '🔩 Transmisión'
    };
    return categories[category] || category;
}

// Generar enlace de Google Maps
function getGoogleMapsLink(address) {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

// Generar enlace de WhatsApp
function getWhatsAppLink(phone, message) {
    const cleanPhone = phone.replace(/\s/g, '').replace(/[^0-9+]/g, '');
    const defaultMessage = 'Hola, estoy interesado en este repuesto';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || defaultMessage)}`;
}

// ====================== TIENDA PÚBLICA ======================

// Cargar categorías en el filtro
function loadCategoriesFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    const categories = getCategories();
    filter.innerHTML = '<option value="all">📦 Todas las categorías</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = `📌 ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
        filter.appendChild(option);
    });
}

// Estado actual de filtros
let currentFilters = {
    search: '',
    category: 'all'
};

// Renderizar productos en la tienda pública
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.warn('No se encontró el grid de productos');
        return;
    }
    
    const products = getProducts();
    console.log('📦 Productos cargados:', products.length);
    
    // Aplicar filtros
    const filtered = products.filter(product => {
        const searchTerm = currentFilters.search.toLowerCase().trim();
        const matchesSearch = searchTerm === '' || 
                             product.name.toLowerCase().includes(searchTerm) ||
                             product.address.toLowerCase().includes(searchTerm) ||
                             product.category.toLowerCase().includes(searchTerm) ||
                             (product.storeName && product.storeName.toLowerCase().includes(searchTerm));
        const matchesCategory = currentFilters.category === 'all' || product.category === currentFilters.category;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔍</span>
                <h2>No se encontraron productos</h2>
                <p>Prueba con otros términos de búsqueda</p>
                <a href="admin.html" class="admin-link" style="margin-top: 1rem; display: inline-block;">🔧 Administrar Productos</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" 
                 onerror="this.src='https://placehold.co/600x400/edf2f7/4a5568?text=Imagen+no+disponible'">
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    $${product.price.toFixed(2)} <span>USD</span>
                </div>
                <div class="product-store-info">
                    <span class="store-name">🏪 ${product.storeName || 'AutoShop Repuestos'}</span>
                    <span class="store-phone">📞 ${product.phone || 'Sin teléfono'}</span>
                </div>
                <div class="product-actions">
                    <a href="${getWhatsAppLink(product.phone, `Hola, quiero información sobre ${product.name}`)}" 
                       target="_blank" 
                       class="btn-whatsapp">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                    </a>
                    <a href="${getGoogleMapsLink(product.address)}" 
                       target="_blank" 
                       class="btn-maps">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        Ver en Maps
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Actualizar filtros
function updateFilters() {
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    
    currentFilters.search = searchTerm;
    currentFilters.category = categoryFilter;
    
    renderProducts();
}

// ====================== INICIALIZACIÓN ======================

// Función para inicializar la tienda
function initStore() {
    console.log('🚗 Inicializando tienda...');
    loadCategoriesFilter();
    renderProducts();
    
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(updateFilters, 300);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updateFilters);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStore);
} else {
    initStore();
}

// Hacer funciones globales para admin.js
window.getProducts = getProducts;
window.saveProducts = saveProducts;
window.getCategories = getCategories;
window.saveCategories = saveCategories;
window.generateId = generateId;
window.getCategoryName = getCategoryName;
window.getGoogleMapsLink = getGoogleMapsLink;
window.getWhatsAppLink = getWhatsAppLink;
window.renderProducts = renderProducts;
window.loadCategoriesFilter = loadCategoriesFilter;
window.updateFilters = updateFilters;
