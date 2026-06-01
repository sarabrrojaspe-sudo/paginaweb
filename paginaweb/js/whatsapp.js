/**
 * WhatsApp Business — Vista temporal
 * Usa la misma configuración de número que js/script.js
 */
const WHATSAPP_NUMBER = '573142568629';
const WHATSAPP_MESSAGE = 'Hola, estoy interesado en BioFit Protein y quiero más información.';

const getWhatsAppChatUrl = () =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const formatPhoneDisplay = (number) => {
    if (!number || number.length < 10) return number;
    const local = number.startsWith('57') ? number.slice(2) : number;
    return `+57 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
};

const initWhatsAppPanel = () => {
    const phoneDisplay = document.getElementById('whatsapp-phone-display');
    const chatBtn = document.getElementById('whatsapp-start-chat');

    if (phoneDisplay) {
        phoneDisplay.textContent = formatPhoneDisplay(WHATSAPP_NUMBER);
    }

    chatBtn?.addEventListener('click', () => {
        const url = getWhatsAppChatUrl();
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppPanel);
} else {
    initWhatsAppPanel();
}
