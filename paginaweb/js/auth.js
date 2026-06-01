/**
 * BioFit Auth — Autenticación local (LocalStorage)
 * Preparado para reemplazarse por API/backend en producción.
 */
const BioFitAuth = (() => {
    const USERS_KEY = 'biofit_users';
    const SESSION_KEY = 'biofit_session';
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch {
            return [];
        }
    };

    const saveUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    const getSession = () => {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    };

    const saveSession = (user) => {
        const session = {
            email: user.email,
            nombre: user.nombre,
            telefono: user.telefono || ''
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        window.dispatchEvent(new CustomEvent('auth:change', { detail: session }));
        return session;
    };

    const isLoggedIn = () => Boolean(getSession());

    const register = ({ nombre, email, password, telefono }) => {
        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedNombre = nombre?.trim();
        const trimmedTelefono = telefono?.trim();

        if (!trimmedNombre || !trimmedEmail || !password) {
            return { success: false, error: 'Completa todos los campos obligatorios.' };
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            return { success: false, error: 'Ingresa un correo electrónico válido.' };
        }

        if (password.length < 6) {
            return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
        }

        const users = getUsers();
        if (users.some((u) => u.email === trimmedEmail)) {
            return { success: false, error: 'Este correo ya está registrado. Inicia sesión.' };
        }

        const newUser = {
            nombre: trimmedNombre,
            email: trimmedEmail,
            password,
            telefono: trimmedTelefono || ''
        };

        users.push(newUser);
        saveUsers(users);
        saveSession(newUser);

        return { success: true, user: newUser };
    };

    const login = ({ email, password }) => {
        const trimmedEmail = email?.trim().toLowerCase();

        if (!trimmedEmail || !password) {
            return { success: false, error: 'Ingresa tu correo y contraseña.' };
        }

        const user = getUsers().find((u) => u.email === trimmedEmail);

        if (!user || user.password !== password) {
            return { success: false, error: 'Correo o contraseña incorrectos.' };
        }

        saveSession(user);
        return { success: true, user };
    };

    const logout = () => {
        localStorage.removeItem(SESSION_KEY);
        window.dispatchEvent(new CustomEvent('auth:change', { detail: null }));
    };

    return {
        getSession,
        isLoggedIn,
        register,
        login,
        logout
    };
})();
