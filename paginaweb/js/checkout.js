/**
 * processPayment — Punto de integración para pasarelas de pago.
 * Actualmente simula el pago. Reemplazar el cuerpo de esta función
 * para conectar Mercado Pago, Wompi, PayU o Stripe.
 */
async function processPayment(paymentData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const isCard = paymentData.method === 'credit' || paymentData.method === 'debit';

            if (isCard && paymentData.card) {
                const { number, cvv, expiry } = paymentData.card;
                if (!number || number.replace(/\s/g, '').length < 16) {
                    reject(new Error('Número de tarjeta inválido'));
                    return;
                }
                if (!cvv || cvv.length < 3) {
                    reject(new Error('CVV inválido'));
                    return;
                }
                if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
                    reject(new Error('Fecha de vencimiento inválida'));
                    return;
                }
            }

            const orderId = `BF-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
            const transactionId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

            resolve({
                success: true,
                orderId,
                transactionId,
                message: 'Pago procesado correctamente'
            });
        }, 1800);
    });
}

const CheckoutApp = (() => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const els = () => ({
        wrapper: document.getElementById('checkout-wrapper'),
        authGate: document.getElementById('auth-gate'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        authMessage: document.getElementById('auth-message'),
        form: document.getElementById('checkout-form'),
        cardForm: document.getElementById('card-form'),
        summaryItems: document.getElementById('summary-items'),
        authSummaryItems: document.getElementById('auth-summary-items'),
        summarySubtotal: document.getElementById('summary-subtotal'),
        summaryIva: document.getElementById('summary-iva'),
        summaryTotal: document.getElementById('summary-total'),
        authSummarySubtotal: document.getElementById('auth-summary-subtotal'),
        authSummaryIva: document.getElementById('auth-summary-iva'),
        authSummaryTotal: document.getElementById('auth-summary-total'),
        payBtn: document.getElementById('pay-btn'),
        payBtnText: document.getElementById('pay-btn-text'),
        payBtnLoader: document.getElementById('pay-btn-loader'),
        checkoutMessage: document.getElementById('checkout-message'),
        confirmation: document.getElementById('checkout-confirmation'),
        orderNumber: document.getElementById('order-number'),
        emptyCart: document.getElementById('empty-cart'),
        checkoutContent: document.getElementById('checkout-content'),
        userBannerName: document.getElementById('user-banner-name'),
        logoutBtn: document.getElementById('logout-btn')
    });

    const showMessage = (el, text, type) => {
        if (!el) return;
        el.textContent = text;
        el.className = `checkout-message checkout-message--${type}`;
        el.hidden = false;
    };

    const hideMessage = (el) => {
        if (el) el.hidden = true;
    };

    const renderCartItems = (container) => {
        if (!container) return;
        const cart = BioFitCart.getCart();
        container.innerHTML = cart.map((item) => `
            <div class="summary-item">
                <img src="${item.image}" alt="${item.name}" class="summary-item__img"/>
                <div class="summary-item__info">
                    <p class="summary-item__name">${item.name}</p>
                    <p class="summary-item__meta">${item.flavor} × ${item.quantity}</p>
                    <p class="summary-item__price">${BioFitCart.formatPrice(item.price)} c/u</p>
                </div>
                <p class="summary-item__total">${BioFitCart.formatPrice(item.price * item.quantity)}</p>
            </div>
        `).join('');
    };

    const renderSummary = () => {
        const e = els();
        renderCartItems(e.summaryItems);
        renderCartItems(e.authSummaryItems);

        const subtotal = BioFitCart.formatPrice(BioFitCart.getSubtotal());
        const iva = BioFitCart.formatPrice(BioFitCart.getIVA());
        const total = BioFitCart.formatPrice(BioFitCart.getTotal());

        [e.summarySubtotal, e.authSummarySubtotal].forEach((el) => { if (el) el.textContent = subtotal; });
        [e.summaryIva, e.authSummaryIva].forEach((el) => { if (el) el.textContent = iva; });
        [e.summaryTotal, e.authSummaryTotal].forEach((el) => { if (el) el.textContent = total; });
    };

    const prefillCheckoutFromSession = () => {
        const session = BioFitAuth.getSession();
        const { form, userBannerName } = els();
        if (!session || !form) return;

        if (userBannerName) userBannerName.textContent = session.nombre;
        if (form.nombre) form.nombre.value = session.nombre || '';
        if (form.email) form.email.value = session.email || '';
        if (form.telefono && session.telefono) form.telefono.value = session.telefono;
    };

    const showAuthGate = () => {
        const { authGate, checkoutContent } = els();
        authGate?.classList.remove('hidden');
        checkoutContent?.classList.add('hidden');
    };

    const showCheckoutForm = () => {
        const { authGate, checkoutContent } = els();
        authGate?.classList.add('hidden');
        checkoutContent?.classList.remove('hidden');
        prefillCheckoutFromSession();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleCardForm = (method) => {
        const { cardForm } = els();
        const showCard = method === 'credit' || method === 'debit';
        cardForm?.classList.toggle('hidden', !showCard);
    };

    const setLoading = (loading) => {
        const { payBtn, payBtnText, payBtnLoader } = els();
        if (payBtn) payBtn.disabled = loading;
        payBtnText?.classList.toggle('hidden', loading);
        payBtnLoader?.classList.toggle('hidden', !loading);
    };

    const validateForm = (form) => {
        const data = {
            nombre: form.nombre.value.trim(),
            email: form.email.value.trim(),
            telefono: form.telefono.value.trim(),
            direccion: form.direccion.value.trim(),
            ciudad: form.ciudad.value.trim(),
            method: form.querySelector('input[name="payment"]:checked')?.value
        };

        if (!data.nombre || !data.email || !data.telefono || !data.direccion || !data.ciudad) {
            return { valid: false, error: 'Por favor, completa todos los campos de envío.' };
        }

        if (!EMAIL_REGEX.test(data.email)) {
            return { valid: false, error: 'Por favor, ingresa un correo electrónico válido.' };
        }

        if (!data.method) {
            return { valid: false, error: 'Selecciona un método de pago.' };
        }

        return { valid: true, data };
    };

    const formatCardNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return digits;
    };

    const initCardInputs = () => {
        const cardNumber = document.getElementById('card-number');
        const cardExpiry = document.getElementById('card-expiry');
        const cardCvv = document.getElementById('card-cvv');

        cardNumber?.addEventListener('input', (e) => {
            e.target.value = formatCardNumber(e.target.value);
        });

        cardExpiry?.addEventListener('input', (e) => {
            e.target.value = formatExpiry(e.target.value);
        });

        cardCvv?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    };

    const initPaymentMethods = () => {
        document.querySelectorAll('input[name="payment"]').forEach((radio) => {
            radio.addEventListener('change', () => toggleCardForm(radio.value));
        });
        const checked = document.querySelector('input[name="payment"]:checked');
        if (checked) toggleCardForm(checked.value);
    };

    const initAuthTabs = () => {
        const tabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.authTab;
                tabs.forEach((t) => {
                    t.classList.toggle('active', t === tab);
                    t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
                });
                loginForm?.classList.toggle('hidden', target !== 'login');
                registerForm?.classList.toggle('hidden', target !== 'register');
                hideMessage(els().authMessage);
            });
        });
    };

    const initAuthForms = () => {
        const { loginForm, registerForm, authMessage } = els();

        loginForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            hideMessage(authMessage);

            const result = BioFitAuth.login({
                email: loginForm.email.value,
                password: loginForm.password.value
            });

            if (result.success) {
                showCheckoutForm();
                return;
            }

            showMessage(authMessage, result.error, 'error');
        });

        registerForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            hideMessage(authMessage);

            const password = registerForm.password.value;
            const passwordConfirm = registerForm.passwordConfirm.value;

            if (password !== passwordConfirm) {
                showMessage(authMessage, 'Las contraseñas no coinciden.', 'error');
                return;
            }

            const result = BioFitAuth.register({
                nombre: registerForm.nombre.value,
                email: registerForm.email.value,
                telefono: registerForm.telefono.value,
                password
            });

            if (result.success) {
                showCheckoutForm();
                return;
            }

            showMessage(authMessage, result.error, 'error');
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!BioFitAuth.isLoggedIn()) {
            showAuthGate();
            showMessage(els().authMessage, 'Debes iniciar sesión para completar el pago.', 'error');
            return;
        }

        const { form, checkoutMessage, confirmation, orderNumber, checkoutContent, wrapper } = els();

        hideMessage(checkoutMessage);

        const validation = validateForm(form);
        if (!validation.valid) {
            showMessage(checkoutMessage, validation.error, 'error');
            return;
        }

        const { data } = validation;
        const cart = BioFitCart.getCart();
        const isCard = data.method === 'credit' || data.method === 'debit';

        let cardData = null;
        if (isCard) {
            cardData = {
                number: form['card-number'].value.trim(),
                holder: form['card-holder'].value.trim(),
                expiry: form['card-expiry'].value.trim(),
                cvv: form['card-cvv'].value.trim()
            };

            if (!cardData.holder) {
                showMessage(checkoutMessage, 'Ingresa el nombre del titular de la tarjeta.', 'error');
                return;
            }
        }

        const paymentData = {
            customer: {
                nombre: data.nombre,
                email: data.email,
                telefono: data.telefono,
                direccion: data.direccion,
                ciudad: data.ciudad
            },
            method: data.method,
            card: cardData,
            items: cart,
            subtotal: BioFitCart.getSubtotal(),
            iva: BioFitCart.getIVA(),
            total: BioFitCart.getTotal()
        };

        setLoading(true);

        try {
            const result = await processPayment(paymentData);

            if (result.success) {
                BioFitCart.clearCart();
                wrapper?.classList.add('hidden');
                confirmation?.classList.remove('hidden');
                if (orderNumber) orderNumber.textContent = result.orderId;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            showMessage(checkoutMessage, error.message || 'Error al procesar el pago. Intenta de nuevo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const initCardPreview = () => {
        const num = document.getElementById('card-number');
        const holder = document.getElementById('card-holder');
        const expiry = document.getElementById('card-expiry');
        const previewNum = document.getElementById('card-preview-number');
        const previewHolder = document.getElementById('card-preview-holder');
        const previewExpiry = document.getElementById('card-preview-expiry');

        num?.addEventListener('input', () => {
            if (previewNum) previewNum.textContent = num.value || '•••• •••• •••• ••••';
        });
        holder?.addEventListener('input', () => {
            if (previewHolder) previewHolder.textContent = holder.value.toUpperCase() || 'NOMBRE APELLIDO';
        });
        expiry?.addEventListener('input', () => {
            if (previewExpiry) previewExpiry.textContent = expiry.value || 'MM/AA';
        });
    };

    const init = () => {
        const { form, emptyCart, wrapper, logoutBtn } = els();
        const cart = BioFitCart.getCart();

        if (cart.length === 0) {
            emptyCart?.classList.remove('hidden');
            wrapper?.classList.add('hidden');
            return;
        }

        emptyCart?.classList.add('hidden');
        wrapper?.classList.remove('hidden');
        renderSummary();
        initAuthTabs();
        initAuthForms();
        initCardInputs();
        initCardPreview();
        initPaymentMethods();
        form?.addEventListener('submit', handleSubmit);

        logoutBtn?.addEventListener('click', () => {
            BioFitAuth.logout();
            showAuthGate();
        });

        if (BioFitAuth.isLoggedIn()) {
            showCheckoutForm();
        } else {
            showAuthGate();
        }
    };

    return { init, renderSummary };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CheckoutApp.init());
} else {
    CheckoutApp.init();
}

window.processPayment = processPayment;
