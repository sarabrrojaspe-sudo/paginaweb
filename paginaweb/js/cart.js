/**
 * BioFit Cart — Capa de datos del carrito (LocalStorage)
 * Preparado para integrarse con checkout y pasarelas de pago.
 */
const BioFitCart = (() => {
    const STORAGE_KEY = 'biofit_cart';
    const IVA_RATE = 0.19;

    const getCart = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    };

    const saveCart = (cart) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    };

    const getItemKey = (id, flavor) => `${id}::${flavor}`;

    const addItem = ({ id, name, flavor, price, image, quantity = 1 }) => {
        const cart = getCart();
        const key = getItemKey(id, flavor);
        const existing = cart.find((item) => getItemKey(item.id, item.flavor) === key);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ id, name, flavor, price: Number(price), image, quantity });
        }

        saveCart(cart);
        return cart;
    };

    const updateQuantity = (id, flavor, quantity) => {
        let cart = getCart();
        const key = getItemKey(id, flavor);
        const item = cart.find((i) => getItemKey(i.id, i.flavor) === key);

        if (!item) return cart;

        if (quantity <= 0) {
            cart = cart.filter((i) => getItemKey(i.id, i.flavor) !== key);
        } else {
            item.quantity = quantity;
        }

        saveCart(cart);
        return cart;
    };

    const removeItem = (id, flavor) => updateQuantity(id, flavor, 0);

    const clearCart = () => {
        saveCart([]);
        return [];
    };

    const getItemCount = () => getCart().reduce((sum, item) => sum + item.quantity, 0);

    const getSubtotal = () =>
        getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);

    const getIVA = () => Math.round(getSubtotal() * IVA_RATE);

    const getTotal = () => getSubtotal() + getIVA();

    const formatPrice = (amount) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);

    return {
        STORAGE_KEY,
        IVA_RATE,
        getCart,
        saveCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getItemCount,
        getSubtotal,
        getIVA,
        getTotal,
        formatPrice,
        getItemKey
    };
})();

/**
 * BioFit Cart UI — Panel lateral, notificaciones e interacción
 */
const BioFitCartUI = (() => {
    let toastTimeout = null;

    const els = () => ({
        panel: document.getElementById('cart-panel'),
        overlay: document.getElementById('cart-overlay'),
        toggle: document.getElementById('cart-toggle'),
        close: document.getElementById('cart-close'),
        count: document.getElementById('cart-count'),
        items: document.getElementById('cart-items'),
        empty: document.getElementById('cart-empty'),
        subtotal: document.getElementById('cart-subtotal'),
        iva: document.getElementById('cart-iva'),
        total: document.getElementById('cart-total'),
        clearBtn: document.getElementById('cart-clear'),
        checkoutBtn: document.getElementById('cart-checkout'),
        toast: document.getElementById('cart-toast')
    });

    const openPanel = () => {
        const { panel, overlay } = els();
        panel?.classList.add('open');
        overlay?.classList.add('open');
        document.body.classList.add('cart-open');
    };

    const closePanel = () => {
        const { panel, overlay } = els();
        panel?.classList.remove('open');
        overlay?.classList.remove('open');
        document.body.classList.remove('cart-open');
    };

    const showToast = (message = 'Producto agregado al carrito') => {
        const { toast } = els();
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const renderItem = (item) => {
        const subtotal = item.price * item.quantity;
        return `
            <div class="cart-item" data-id="${item.id}" data-flavor="${item.flavor}">
                <img class="cart-item__img" src="${item.image}" alt="${item.name}" loading="lazy"/>
                <div class="cart-item__info">
                    <h4 class="cart-item__name">${item.name}</h4>
                    <p class="cart-item__flavor">Sabor: ${item.flavor}</p>
                    <p class="cart-item__price">${BioFitCart.formatPrice(item.price)} c/u</p>
                    <div class="cart-item__qty">
                        <button type="button" class="cart-qty-btn" data-action="decrease" aria-label="Disminuir cantidad">−</button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button type="button" class="cart-qty-btn" data-action="increase" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <p class="cart-item__subtotal">Subtotal: ${BioFitCart.formatPrice(subtotal)}</p>
                </div>
                <button type="button" class="cart-item__remove" data-action="remove" aria-label="Eliminar producto">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        `;
    };

    const render = () => {
        const { count, items, empty, subtotal, iva, total, clearBtn, checkoutBtn } = els();
        const cart = BioFitCart.getCart();
        const itemCount = BioFitCart.getItemCount();

        if (count) {
            count.textContent = itemCount;
            count.classList.toggle('hidden', itemCount === 0);
        }

        if (items && empty) {
            if (cart.length === 0) {
                items.innerHTML = '';
                empty.classList.remove('hidden');
            } else {
                empty.classList.add('hidden');
                items.innerHTML = cart.map(renderItem).join('');
            }
        }

        if (subtotal) subtotal.textContent = BioFitCart.formatPrice(BioFitCart.getSubtotal());
        if (iva) iva.textContent = BioFitCart.formatPrice(BioFitCart.getIVA());
        if (total) total.textContent = BioFitCart.formatPrice(BioFitCart.getTotal());

        const hasItems = cart.length > 0;
        clearBtn?.toggleAttribute('disabled', !hasItems);
        checkoutBtn?.toggleAttribute('disabled', !hasItems);
    };

    const handleCartAction = (event) => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;

        const itemEl = btn.closest('.cart-item');
        if (!itemEl) return;

        const { id, flavor } = itemEl.dataset;
        const action = btn.dataset.action;
        const cart = BioFitCart.getCart();
        const item = cart.find((i) => i.id === id && i.flavor === flavor);
        if (!item) return;

        if (action === 'increase') {
            BioFitCart.updateQuantity(id, flavor, item.quantity + 1);
        } else if (action === 'decrease') {
            BioFitCart.updateQuantity(id, flavor, item.quantity - 1);
        } else if (action === 'remove') {
            BioFitCart.removeItem(id, flavor);
        }

        render();
    };

    const initAddToCartButtons = () => {
        document.querySelectorAll('.add-to-cart').forEach((btn) => {
            btn.addEventListener('click', () => {
                const productCard = btn.closest('.product-card') || btn.closest('[data-product-id]');
                const container = productCard || btn;

                const id = btn.dataset.id || container.dataset.productId;
                const name = btn.dataset.name || container.dataset.productName;
                const flavorSelect = container.querySelector('.product-flavor');
                const flavor = btn.dataset.flavor || flavorSelect?.value || 'Estándar';
                const price = btn.dataset.price || container.dataset.productPrice;
                const image = btn.dataset.image || container.dataset.productImage;

                if (!id || !name || !price) return;

                BioFitCart.addItem({ id, name, flavor, price, image });
                render();
                showToast('Producto agregado al carrito');
            });
        });
    };

    const init = () => {
        const { toggle, close, overlay, clearBtn, checkoutBtn, items } = els();

        toggle?.addEventListener('click', openPanel);
        close?.addEventListener('click', closePanel);
        overlay?.addEventListener('click', closePanel);

        clearBtn?.addEventListener('click', () => {
            if (BioFitCart.getCart().length === 0) return;
            if (confirm('¿Deseas vaciar el carrito?')) {
                BioFitCart.clearCart();
                render();
            }
        });

        checkoutBtn?.addEventListener('click', () => {
            if (BioFitCart.getCart().length === 0) return;
            window.location.href = 'checkout.html';
        });

        items?.addEventListener('click', handleCartAction);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePanel();
        });

        window.addEventListener('cart:updated', render);
        initAddToCartButtons();
        render();
    };

    return { init, render, openPanel, closePanel, showToast };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BioFitCartUI.init());
} else {
    BioFitCartUI.init();
}
