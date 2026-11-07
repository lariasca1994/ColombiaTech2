import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout } from '../authSlice'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const consulta = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
}) // Hace las veces de Axios

// Si el servidor rechaza la sesión (p. ej. porque la contraseña se restableció y se
// cerraron todas las sesiones), se borra la sesión local y se vuelve al ingreso.
// Las rutas del ingreso no cuentan: allí un 401 es un código o una contraseña errados.
const PUBLICAS = /^\/?auth\/(login|recuperar|restablecer|mfa\/(configurar|activar|correo|verificar|recuperar))/
const consultaConSesion = async (args, api, extra) => {
    const respuesta = await consulta(args, api, extra)
    const url = typeof args === 'string' ? args : args.url
    if (respuesta.error?.status === 401 && api.getState().auth.token && !PUBLICAS.test(url)) {
        localStorage.removeItem('sessionData')
        api.dispatch(logout())
        if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return respuesta
}

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: consultaConSesion,
    endpoints: (builder) => ({
        getUserById: builder.query({
            query: (_id) => '/users/' + _id,
            providesTags: ['User']
        }),
        createUser: builder.mutation({
            query: (newUser) => ({
                url: '/users',
                method: 'POST',
                body: newUser
            }),
            invalidatesTags: ["Users"] // Se ejecuta cuando hay un cambio en la BD
        }),
        updateUser: builder.mutation({
            query: (user) => ({
                url: `/users/${user._id}`,
                method: 'PUT',
                body: user
            }),
            invalidatesTags: ["Users", "User"]
        }),
        deleteUser: builder.mutation({
            query: (_id) => ({
                url: `/users/${_id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Users"]
        }),
        // NOTA: el backend nuevo todavia no tiene un endpoint de subida de
        // archivos (/upload). Esta mutation queda igual que antes pero
        // fallara hasta que se agregue ese endpoint en Nest.
        uploadAvatar: builder.mutation({
            query: (body) => ({
                url: `/upload/${body._id}/user`,
                method: "POST",
                body: body.file
            }),
            invalidatesTags: ["Users"]
        }),
        login: builder.mutation({
            query: (body) => ({
                url: 'auth/login',
                method: 'POST',
                body: body
            })
        }),
        recuperar: builder.mutation({
            query: (body) => ({ url: 'auth/recuperar', method: 'POST', body })
        }),
        restablecer: builder.mutation({
            query: (body) => ({ url: 'auth/restablecer', method: 'POST', body })
        }),
        cambiarContrasena: builder.mutation({
            query: (body) => ({ url: 'auth/cambiar-contrasena', method: 'POST', body })
        }),
        // Verificación en dos pasos
        mfaConfigurar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/configurar', method: 'POST', body }) }),
        mfaActivar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/activar', method: 'POST', body }) }),
        mfaVerificar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/verificar', method: 'POST', body }) }),
        mfaCorreo: builder.mutation({ query: (body) => ({ url: 'auth/mfa/correo', method: 'POST', body }) }),
        // "Perdí mi autenticador": código al correo de la cuenta y, después, la app nueva (QR).
        mfaRecuperar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/recuperar', method: 'POST', body }) }),
        mfaRecuperarVerificar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/recuperar/verificar', method: 'POST', body }) }),
        mfaRecuperarActivar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/recuperar/activar', method: 'POST', body }) }),
        getMfa: builder.query({ query: () => 'auth/mfa' }),
        mfaAgregar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/agregar', method: 'POST', body }) }),
        mfaAgregarActivar: builder.mutation({ query: (body) => ({ url: 'auth/mfa/agregar/activar', method: 'POST', body }) }),
        mfaPreferido: builder.mutation({ query: (body) => ({ url: 'auth/mfa/preferido', method: 'POST', body }) })
    })
})

/** Segun la nomenclatura de la libreria se usa use al principio 
 * y Query o Mutation al final segun corresponda */
export const { useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUploadAvatarMutation,
    useLoginMutation,
    useRecuperarMutation,
    useRestablecerMutation,
    useCambiarContrasenaMutation,
    useMfaConfigurarMutation,
    useMfaActivarMutation,
    useMfaVerificarMutation,
    useMfaCorreoMutation,
    useMfaRecuperarMutation,
    useMfaRecuperarVerificarMutation,
    useMfaRecuperarActivarMutation,
    useGetMfaQuery,
    useMfaAgregarMutation,
    useMfaAgregarActivarMutation,
    useMfaPreferidoMutation
} = apiSlice
