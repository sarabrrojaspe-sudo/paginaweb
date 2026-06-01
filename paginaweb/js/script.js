// Tailwind CSS configuration
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "on-surface-variant": "#c5c6cd",
                "surface-container": "#1e2020",
                "error": "#ffb4ab",
                "error-container": "#93000a",
                "surface-bright": "#37393a",
                "on-primary-fixed": "#0d1c32",
                "on-primary": "#233148",
                "secondary-fixed": "#baf600",
                "on-secondary": "#263500",
                "inverse-surface": "#e2e2e2",
                "on-primary-fixed-variant": "#39475f",
                "on-tertiary": "#2a313b",
                "background": "#121414",
                "surface": "#121414",
                "surface-container-low": "#1a1c1c",
                "on-secondary-fixed-variant": "#394e00",
                "tertiary-container": "#131923",
                "on-error": "#690005",
                "inverse-on-surface": "#2f3131",
                "surface-container-lowest": "#0c0f0f",
                "on-background": "#e2e2e2",
                "secondary-container": "#baf600",
                "on-secondary-container": "#516e00",
                "outline-variant": "#44474d",
                "outline": "#8f9097",
                "on-surface": "#e2e2e2",
                "secondary-fixed-dim": "#a3d800",
                "surface-variant": "#333535",
                "surface-dim": "#121414",
                "surface-container-high": "#282a2b",
                "secondary": "#ffffff",
                "on-error-container": "#ffdad6",
                "tertiary-fixed-dim": "#c0c7d4",
                "on-primary-container": "#74829d",
                "surface-container-highest": "#333535",
                "primary-fixed-dim": "#b9c7e4",
                "tertiary": "#c0c7d4",
                "on-tertiary-fixed-variant": "#404752",
                "inverse-primary": "#515f78",
                "on-tertiary-fixed": "#151c26",
                "surface-tint": "#b9c7e4",
                "on-secondary-fixed": "#151f00",
                "primary": "#b9c7e4",
                "on-tertiary-container": "#7b828e",
                "primary-container": "#0a192f",
                "tertiary-fixed": "#dce3f0",
                "primary-fixed": "#d6e3ff"
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px"
            },
            spacing: {
                md: "24px",
                xl: "80px",
                "margin-mobile": "16px",
                gutter: "24px",
                xs: "4px",
                sm: "12px",
                base: "8px",
                lg: "48px",
                "margin-desktop": "64px"
            },
            fontFamily: {
                "body-lg": ["Hanken Grotesk"],
                "label-bold": ["Hanken Grotesk"],
                "headline-md": ["Barlow Condensed"],
                "display-xl": ["Barlow Condensed"],
                "body-md": ["Hanken Grotesk"],
                "headline-lg-mobile": ["Barlow Condensed"],
                "headline-lg": ["Barlow Condensed"]
            },
            fontSize: {
                "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
                "label-bold": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "700" }],
                "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
                "display-xl": ["72px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
                "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
                "headline-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
                "headline-lg": ["48px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }]
            }
        }
    }
};

// ─── Redes sociales — Configuración centralizada ───────────────────────────
const WHATSAPP_NUMBER = '573142568629';
const WHATSAPP_MESSAGE = 'Hola, estoy interesado en BioFit Protein y quiero más información sobre la proteína premium.';
const WHATSAPP_ADVISORY_MESSAGE = 'Hola 👋\nEstoy interesado en los productos de Biofarma y me gustaría recibir asesoría personalizada.';

const SOCIAL_CONFIG = {
    facebook: 'https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F%3Flocale%3Des_LA',
    instagram: 'https://www.instagram.com/?hl=es',
    whatsapp: 'whatsapp.html' // Panel temporal WhatsApp Business
};

const SECTIONS = ['inicio', 'productos', 'beneficios', 'nosotros', 'contacto'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getWhatsAppUrl = (message) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const isWhatsAppAvailable = () =>
    Boolean(WHATSAPP_NUMBER && String(WHATSAPP_NUMBER).replace(/\D/g, '').length >= 10);

const openWhatsAppAdvisory = () => {
    if (!isWhatsAppAvailable()) {
        alert('WhatsApp de la empresa no disponible actualmente.');
        return;
    }
    window.open(getWhatsAppUrl(WHATSAPP_ADVISORY_MESSAGE), '_blank', 'noopener,noreferrer');
};

const getHeaderHeight = () => {
    const header = document.querySelector('header');
    return header ? header.offsetHeight : 0;
};

const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const top = section.getBoundingClientRect().top + window.scrollY - getHeaderHeight();
    window.scrollTo({ top, behavior: 'smooth' });
};

const openWhatsApp = (message = WHATSAPP_MESSAGE) => {
    const url = getWhatsAppUrl(message);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
};

const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url.trim(), window.location.href);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

/** Resuelve URLs absolutas y rutas relativas (ej. whatsapp.html) */
const resolveChannelUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    try {
        return new URL(trimmed, window.location.href).href;
    } catch {
        return null;
    }
};

const getChannelUrl = (channel) => {
    switch (channel) {
        case 'facebook':
            return SOCIAL_CONFIG.facebook;
        case 'instagram':
            return SOCIAL_CONFIG.instagram;
        case 'whatsapp':
            return SOCIAL_CONFIG.whatsapp || getWhatsAppUrl(WHATSAPP_MESSAGE);
        default:
            return null;
    }
};

/** Abre enlace externo o ruta interna en pestaña nueva */
const openExternalLink = (url) => {
    const resolved = resolveChannelUrl(url);
    if (!resolved || !isValidUrl(resolved)) return false;
    window.open(resolved, '_blank', 'noopener,noreferrer');
    return true;
};

/**
 * Inicializa tarjetas de redes sociales y enlaces del footer.
 * Tienda Física → scroll a contacto | Redes → window.open en nueva pestaña
 */
const initChannels = () => {
    document.querySelectorAll('.channel-link, .footer-social-link').forEach((link) => {
        const section = link.dataset.section;
        const channel = link.dataset.channel;

        if (channel) {
            const url = getChannelUrl(channel);
            const resolved = resolveChannelUrl(url);
            if (resolved && isValidUrl(resolved)) link.href = resolved;
        }

        link.addEventListener('click', (event) => {
            if (section) {
                event.preventDefault();
                scrollToSection(section);
                return;
            }

            if (channel) {
                event.preventDefault();
                const url = getChannelUrl(channel);

                if (openExternalLink(url)) return;

                scrollToSection('contacto');
            }
        });
    });
};

const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

const showFormMessage = (element, message, type) => {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('hidden', 'success', 'error');
    element.classList.add(type);
};

const hideFormMessage = (element) => {
    if (!element) return;
    element.classList.add('hidden');
    element.classList.remove('success', 'error');
    element.textContent = '';
};

const initCardAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card').forEach((card) => {
        card.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        observer.observe(card);
    });
};

const initHeaderScroll = () => {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('bg-background/95', 'backdrop-blur-xl', 'py-2');
            header.classList.remove('h-20');
            header.classList.add('h-16');
        } else {
            header.classList.remove('bg-background/95', 'backdrop-blur-xl', 'py-2');
            header.classList.add('h-20');
            header.classList.remove('h-16');
        }
    });
};

const initSmoothNavigation = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const sectionId = href.slice(1);
        if (!SECTIONS.includes(sectionId)) return;

        link.addEventListener('click', (event) => {
            event.preventDefault();
            scrollToSection(sectionId);
            history.pushState(null, '', `#${sectionId}`);
        });
    });
};

const initActiveNavHighlight = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length) return;

    const sections = SECTIONS
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const setActiveLink = (sectionId) => {
        navLinks.forEach((link) => {
            const isActive = link.dataset.section === sectionId;
            link.classList.toggle('active', isActive);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        },
        {
            rootMargin: `-${getHeaderHeight()}px 0px -50% 0px`,
            threshold: 0
        }
    );

    sections.forEach((section) => observer.observe(section));
    setActiveLink('inicio');
};

const initButtons = () => {
    document.getElementById('btn-header-comprar')?.addEventListener('click', () => {
        scrollToSection('productos');
    });

    document.getElementById('btn-hero-comprar')?.addEventListener('click', () => {
        scrollToSection('productos');
    });

    document.getElementById('btn-hero-info')?.addEventListener('click', () => {
        scrollToSection('beneficios');
    });
};

const initContactForm = () => {
    document.getElementById('btn-solicitar-asesoria')?.addEventListener('click', openWhatsAppAdvisory);
};

const initSubscribeForm = () => {
    const form = document.getElementById('subscribe-form');
    const messageEl = document.getElementById('subscribe-message');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        hideFormMessage(messageEl);

        const email = form.email.value.trim();

        if (!email) {
            showFormMessage(messageEl, 'Por favor, ingresa tu correo electrónico.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showFormMessage(messageEl, 'Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        showFormMessage(messageEl, '¡Suscripción exitosa! Recibirás nuestras novedades pronto.', 'success');
        form.reset();
    });
};

const initBioFit = () => {
    initCardAnimations();
    initHeaderScroll();
    initSmoothNavigation();
    initActiveNavHighlight();
    initButtons();
    initChannels();
    initContactForm();
    initSubscribeForm();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBioFit);
} else {
    initBioFit();
}
