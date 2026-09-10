import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { logout } from '../features/authSlice'

// Eventos que cuentan como "el usuario sigue activo"
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

/**
 * Cierra la sesión automáticamente si no hay actividad del usuario
 * durante `timeoutMs` (por defecto 30 segundos). Solo corre mientras
 * hay una sesión activa — no hace nada en /login o /create-user.
 */
export default function useInactivityLogout(timeoutMs = 30_000) {
    const isAutheticated = useSelector((state) => state.auth.isAutheticated)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const timerRef = useRef(null)

    useEffect(() => {
        if (!isAutheticated) {
            return // no hay sesión que cerrar
        }

        const handleInactivityLogout = () => {
            dispatch(logout())
            localStorage.removeItem('sessionData')
            Swal.fire({
                icon: 'info',
                title: 'Sesión cerrada por inactividad',
                text: `Han pasado más de ${Math.round(timeoutMs / 1000)} segundos sin actividad.`,
                showConfirmButton: true,
            }).then(() => {
                navigate('/login')
            })
        }

        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            timerRef.current = setTimeout(handleInactivityLogout, timeoutMs)
        }

        resetTimer()

        ACTIVITY_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, resetTimer)
        })

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            ACTIVITY_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, resetTimer)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutheticated, timeoutMs])
}