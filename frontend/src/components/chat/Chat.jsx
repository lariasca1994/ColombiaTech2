import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { useGetMessagesQuery } from '../../features/api/apiMessageSlice'
import { useSelector } from "react-redux";
import './chat.css'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

// Presentación (solo visual): hora legible y separadores "Hoy" / "Ayer" en lugar de la fecha ISO.
const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
function dia(iso) {
    const d = new Date(iso)
    const hoy = new Date()
    const ayer = new Date(); ayer.setDate(hoy.getDate() - 1)
    if (d.toDateString() === hoy.toDateString()) return 'Hoy'
    if (d.toDateString() === ayer.toDateString()) return 'Ayer'
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}
const nombreDe = (u) => [u?.name, u?.lastname].filter(Boolean).join(' ') || 'Usuario'

export default function Chat() {

    const { data, isLoading, isError, error } = useGetMessagesQuery()
    const user = useSelector((state) => state.auth.user);
    const [messages, setMessage] = useState([])
    const [conectado, setConectado] = useState(false)
    const socketRef = useRef(null)
    const lista = useRef(null)
    const nuevos = useRef(new Set())

    // CORRECCIÓN: el original creaba `io(...)` directamente en el cuerpo
    // del componente, así que se abría una conexión de socket NUEVA en
    // cada render (y se registraban los listeners una y otra vez). Con
    // useEffect + useRef, la conexión se abre una sola vez y se cierra
    // al desmontar el componente.
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'] })
        socketRef.current = socket

        socket.on('connect', () => {
            setConectado(true)
        })
        socket.on('disconnect', () => setConectado(false))

        socket.on('message-receipt', (newMessage) => {
            if (newMessage?._id) nuevos.current.add(newMessage._id)
            setMessage((prev) => [...prev, newMessage])
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            body: e.target.message.value,
            from: user._id,
            to: user._id
        }
        socketRef.current?.emit("message", payload)
        e.target.message.value = ""
    }

    useEffect(() => {
        if (data) {
            setMessage(data)
        }
    }, [data])

    // Siempre se ve el último mensaje.
    useEffect(() => {
        const l = lista.current
        if (l) l.scrollTo({ top: l.scrollHeight, behavior: messages.length > 1 && nuevos.current.size ? 'smooth' : 'auto' })
    }, [messages])

    if (isError) return (<div role="alert" className="max-w-4xl mx-auto px-5 py-5">Error: {error.message} </div>)

    let ultimoDia = null

    return (
        <div className="chat-marco">
            <section className="chat" aria-label="Chat">
                <header className="chat-cabecera">
                    <div className="chat-icono" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
                    </div>
                    <div>
                        <h1>Chat</h1>
                        <p className={`chat-estado${conectado ? ' en-vivo' : ''}`}>
                            <i aria-hidden="true" />{conectado ? 'En vivo' : 'Conectando…'}
                        </p>
                    </div>
                </header>

                {/* Seccion de Mensajes */}
                <div className="chat-mensajes" ref={lista} aria-live="polite">
                    {isLoading ? (
                        <div role="status" className="chat-esqueleto">
                            {[0, 1, 2, 3].map((i) => <span key={i} className={i % 2 ? 'propio' : ''} />)}
                            <span className="sr-only">Cargando mensajes…</span>
                        </div>
                    ) : messages.map(message => {
                        const propio = message.from && user._id == message.from._id
                        const d = message.createdAt ? dia(message.createdAt) : null
                        const separador = d && d !== ultimoDia
                        if (d) ultimoDia = d
                        return (
                            <div key={message._id} className="chat-grupo">
                                {separador && <p className="chat-dia"><span>{d}</span></p>}
                                <div className={`chat-fila${propio ? ' propia' : ''}${nuevos.current.has(message._id) ? ' nueva' : ''}`}>
                                    {!propio && (message.from?.avatar
                                        ? <img className="chat-avatar" src={message.from.avatar} alt="" />
                                        : <span className="chat-avatar" aria-hidden="true">{nombreDe(message.from).slice(0, 1)}</span>)}
                                    <div className="chat-burbuja">
                                        {!propio && <p className="chat-autor">{nombreDe(message.from)}</p>}
                                        <p>{message.body}</p>
                                        {message.createdAt && <time dateTime={message.createdAt}>{hora(message.createdAt)}</time>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <form onSubmit={handleSubmit} className="chat-escribir">
                    <label htmlFor="mensaje-chat" className="sr-only">Mensaje</label>
                    <input id="mensaje-chat" type="text"
                        name="message"
                        autoComplete="off"
                        placeholder="Escribir mensaje... " />
                    <button className="chat-enviar" aria-label="Send">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
                    </button>
                </form>
            </section>
        </div>
    )
}
