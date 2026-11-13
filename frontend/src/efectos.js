/* Efectos globales (web y PWA): onda desde el punto del toque en los botones
   principales y temblor del botón de envío cuando aparece un error
   (role="alert"). Sin dependencias; si algo falla, la app sigue igual. */
const reducir = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const BOTON = 'button[class*="bg-emerald-6"], button[class*="bg-emerald-5"], .menu-op'

function onda(e) {
    const b = e.target.closest?.(BOTON)
    if (!b || b.disabled || reducir()) return
    const r = b.getBoundingClientRect()
    const o = document.createElement('span')
    o.className = b.classList.contains('menu-op') ? 'ct-onda oscura' : 'ct-onda'
    o.style.setProperty('--x', `${e.clientX - r.left}px`)
    o.style.setProperty('--y', `${e.clientY - r.top}px`)
    o.style.setProperty('--d', `${Math.max(r.width, r.height) * 2.2}px`)
    b.appendChild(o)
    o.addEventListener('animationend', () => o.remove())
}

export function temblar(el) {
    if (!el || reducir()) return
    el.classList.remove('ct-temblor')
    void el.offsetWidth
    el.classList.add('ct-temblor')
    el.addEventListener('animationend', () => el.classList.remove('ct-temblor'), { once: true })
}

// Un aviso de error nuevo hace temblar el botón de envío de su formulario.
function vigilarErrores() {
    new MutationObserver((cambios) => {
        cambios.forEach((c) => c.addedNodes.forEach((n) => {
            if (!(n instanceof HTMLElement)) return
            const aviso = n.matches('[role="alert"]') ? n : n.querySelector?.('[role="alert"]')
            if (!aviso) return
            const zona = aviso.closest('section, form, main') || document
            temblar(zona.querySelector('button[type="submit"], form button:not([type="button"])'))
        }))
    }).observe(document.body, { childList: true, subtree: true })
}

export function iniciarEfectos() {
    document.addEventListener('pointerdown', onda, { passive: true })
    vigilarErrores()
}
