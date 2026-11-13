/** Candado pequeño sobre el título del paso del código: flota despacio; con el
 *  código correcto el arco sube y se abre; con uno equivocado se sacude.
 *  Decorativo: el resultado siempre va también en texto.
 *  estado: "normal" | "verificando" | "abierto" | "error". */
export default function Candado({ estado = 'normal' }) {
    return (
        <div className={`candado candado-${estado}`} aria-hidden="true">
            <svg viewBox="0 0 48 48">
                <path className="arco" d="M15 22v-7a9 9 0 0 1 18 0v7" />
                <rect className="cuerpo" x="9" y="21" width="30" height="21" rx="6" />
                <circle className="ojo" cx="24" cy="31.5" r="3.4" />
            </svg>
        </div>
    )
}
