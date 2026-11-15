/**
 * Piezas comunes de las pantallas internas (casas, perfil, contraseña,
 * seguridad): cabecera de página, tarjeta, campo con etiqueta, zona para
 * subir una imagen y estado de carga. Usan los colores del proyecto
 * (estilos/pantallas.css) y funcionan igual en tema claro y oscuro.
 */
import { useState } from "react";

export function CabeceraPagina({ antetitulo, titulo, descripcion, children }) {
    return (
        <header className="pg-cabecera">
            <div>
                {antetitulo && <p className="pg-antetitulo">{antetitulo}</p>}
                <h1 className="pg-titulo">{titulo}</h1>
                {descripcion && <p className="pg-descripcion">{descripcion}</p>}
            </div>
            {children && <div className="pg-acciones">{children}</div>}
        </header>
    );
}

export function Tarjeta({ titulo, descripcion, children, className = "" }) {
    return (
        <section className={`pg-tarjeta ${className}`}>
            {(titulo || descripcion) && (
                <header className="pg-tarjeta-cabeza">
                    {titulo && <h2>{titulo}</h2>}
                    {descripcion && <p>{descripcion}</p>}
                </header>
            )}
            {children}
        </section>
    );
}

/** Campo con etiqueta asociada; `ayuda` va debajo. `ancho="completo"` ocupa toda la fila. */
export function Campo({ id, etiqueta, ayuda, ancho, children }) {
    return (
        <div className={`pg-campo${ancho === "completo" ? " pg-campo--completo" : ""}`}>
            <label htmlFor={id}>{etiqueta}</label>
            {children}
            {ayuda && <span className="pg-ayuda">{ayuda}</span>}
        </div>
    );
}

/** Zona para subir una imagen con vista previa del archivo elegido. */
export function ZonaImagen({ id, nombre, etiqueta, imagenActual, onChange }) {
    const [vista, setVista] = useState(null);
    const cambiar = (e) => {
        const archivo = e.target.files?.[0];
        setVista(archivo ? URL.createObjectURL(archivo) : null);
        onChange?.(e);
    };
    const mostrar = vista || imagenActual;
    return (
        <label htmlFor={id} className="pg-zona-imagen">
            {mostrar ? (
                <img src={mostrar} alt="" />
            ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 15V4m0 0-4 4m4-4 4 4" /></svg>
            )}
            <span className="pg-zona-texto">
                <strong>{mostrar ? "Cambiar imagen" : etiqueta}</strong>
                <small>PNG o JPG · toca o arrastra el archivo aquí</small>
            </span>
            <input id={id} name={nombre} accept="image/png, image/jpeg" type="file" className="sr-only" onChange={cambiar} />
        </label>
    );
}

export function Cargando({ texto = "Cargando…" }) {
    return (
        <div role="status" className="pg-cargando">
            <span className="pg-rueda" aria-hidden="true" />
            <span>{texto}</span>
        </div>
    );
}

export function AvisoError({ children }) {
    return <div role="alert" className="pg-aviso pg-aviso--error">{children}</div>;
}
