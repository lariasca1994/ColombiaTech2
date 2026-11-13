import { useEffect, useState } from 'react'

/** Tiempo que le queda al código: con la app autenticadora, cuánto falta para
 *  que muestre otro (cambia cada 30 s); con el correo, cuánto falta para que
 *  venza (minutos). */
export default function AnilloCodigo({ minutos }) {
    const [inicio] = useState(() => Date.now())
    const [, setTic] = useState(0)
    useEffect(() => { const t = setInterval(() => setTic((n) => n + 1), 1000); return () => clearInterval(t) }, [])

    let resto
    let total
    let texto
    if (minutos) {
        total = minutos * 60
        resto = Math.max(0, Math.round((inicio + total * 1000 - Date.now()) / 1000))
        texto = resto
            ? `El código vence en ${Math.floor(resto / 60)}:${String(resto % 60).padStart(2, '0')}`
            : 'El código venció. Pide otro.'
    } else {
        total = 30
        resto = 30 - (Math.floor(Date.now() / 1000) % 30)
        texto = `El código de tu app cambia en ${resto} s`
    }
    const urgente = resto <= (minutos ? 60 : 5)
    return (
        <p className={`anillo${urgente ? ' urgente' : ''}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle className="anillo-fondo" cx="12" cy="12" r="9" />
                <circle className="anillo-valor" cx="12" cy="12" r="9" pathLength="1" style={{ strokeDashoffset: 1 - resto / total }} />
            </svg>
            <span>{texto}</span>
        </p>
    )
}
