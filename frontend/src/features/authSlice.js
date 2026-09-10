import { createSlice } from '@reduxjs/toolkit'

// CORRECCIÓN: antes, el estado inicial siempre era "no logueado", y un
// useEffect en App.jsx recién actualizaba el estado DESPUÉS del primer
// render leyendo localStorage. Eso dejaba una fracción de segundo donde
// PrivateRoute ya te mandaba a /login antes de que el estado se pusiera
// al día — por eso, al recargar, la página pedía login pero el header
// (que sí reacciona al cambio posterior) se veía logueado.
//
// Ahora el estado inicial se calcula leyendo localStorage de una vez,
// antes del primer render, así que PrivateRoute nunca ve un estado
// "no logueado" de mentiras.
function loadInitialAuthState() {
    try {
        const stored = localStorage.getItem('sessionData')
        if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed?.token) {
                return {
                    token: parsed.token,
                    isAutheticated: true,
                    user: parsed.user,
                }
            }
        }
    } catch (e) {
        console.error('No se pudo leer la sesión guardada:', e)
    }
    return { token: null, isAutheticated: false, user: null }
}

const initialState = loadInitialAuthState()

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /** Funciones que cambian el valor del estado */
        loginSuccess: (state, action) => {
            state.token = action.payload.token;
            state.isAutheticated = true;
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.token = null;
            state.isAutheticated = false;
            state.user = null;
        }
    }
})

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
