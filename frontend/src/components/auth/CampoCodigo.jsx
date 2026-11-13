import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const N = 6

/**
 * Campo del código de 6 dígitos dibujado como seis casillas con relieve. Es el
 * mismo <input name="codigo"> de siempre (autocompletado, pegar, pruebas
 * automáticas): las casillas solo lo muestran. Cada casilla se hunde al
 * escribir y se ilumina al llenarse.
 */
const CampoCodigo = forwardRef(function CampoCodigo({ id = 'codigo', autoFocus = true }, ref) {
    const input = useRef(null)
    const caja = useRef(null)
    const [valor, setValor] = useState('')
    const [foco, setFoco] = useState(false)
    const [pulso, setPulso] = useState(-1)

    useImperativeHandle(ref, () => ({
        // Tras un código equivocado: tiembla y se vacía.
        fallar() {
            const c = caja.current
            if (c) { c.classList.remove('ct-temblor'); void c.offsetWidth; c.classList.add('ct-temblor') }
            setTimeout(() => { setValor(''); input.current?.focus() }, 420)
        },
        limpiar() { setValor('') },
    }))

    useEffect(() => { if (pulso >= 0) { const t = setTimeout(() => setPulso(-1), 300); return () => clearTimeout(t) } return undefined }, [pulso])

    const cambiar = (e) => {
        const limpio = e.target.value.replace(/\D/g, '').slice(0, N)
        if (limpio.length > valor.length) setPulso(limpio.length - 1)
        setValor(limpio)
    }
    const alFinal = () => { const l = input.current?.value.length || 0; try { input.current?.setSelectionRange(l, l) } catch { /* nada */ } }

    return (
        <div className={`casillas${valor.length === N ? ' completa' : ''}`} ref={caja}>
            <input ref={input} type="text" id={id} name="codigo" required inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7}
                autoComplete="one-time-code" autoFocus={autoFocus} value={valor} onChange={cambiar}
                onFocus={() => { setFoco(true); alFinal() }} onBlur={() => setFoco(false)} onClick={alFinal} onKeyUp={alFinal} />
            <div className="casillas-vista" aria-hidden="true">
                {Array.from({ length: N }, (_, i) => (
                    <span key={i} className={[
                        valor[i] ? 'llena' : '',
                        foco && i === Math.min(valor.length, N - 1) ? 'activa' : '',
                        pulso === i ? 'pulso' : '',
                    ].join(' ')}>{valor[i] || ''}</span>
                ))}
            </div>
        </div>
    )
})

export default CampoCodigo
