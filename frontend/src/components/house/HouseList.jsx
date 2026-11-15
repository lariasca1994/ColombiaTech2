import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useDeleteHouseMutation, useGetHousesQuery } from '../../features/api/apiHousesSlice';
import { AvisoError, CabeceraPagina, Cargando } from '../ui/Pagina';

const PESOS = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const precio = (v) => (Number.isFinite(Number(v)) ? PESOS.format(Number(v)) : v);
const sinTildes = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Catálogo de casas publicadas: tarjetas con foto, precio y datos, búsqueda y acciones. */
export default function HouseList() {
    const { data: houses, isLoading, isError, error } = useGetHousesQuery();
    const [deleteHouse] = useDeleteHouseMutation();
    const [buscar, setBuscar] = useState('');

    const visibles = useMemo(() => {
        const q = sinTildes(buscar.trim());
        if (!q) return houses ?? [];
        return (houses ?? []).filter((h) =>
            [h.address, h.city, h.state, h.type, h.code].some((c) => sinTildes(c).includes(q)));
    }, [houses, buscar]);

    const eliminar = (house) => {
        Swal.fire({
            title: `¿Eliminar la casa ${house.code}?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        }).then((r) => { if (r.isConfirmed) deleteHouse(house.code); });
    };

    return (
        <div className="pg">
            <CabeceraPagina antetitulo="Casas" titulo="Casas publicadas"
                descripcion="Explora las viviendas disponibles, busca por ciudad, departamento o código y administra las tuyas.">
                <Link to="/create-house" className="pg-boton bg-emerald-600 hover:bg-emerald-700 text-white">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Publicar casa
                </Link>
            </CabeceraPagina>

            {isLoading && <Cargando texto="Cargando casas…" />}
            {isError && <AvisoError>No se pudieron cargar las casas. {error?.data?.message || ''}</AvisoError>}

            {!isLoading && !isError && (
                <>
                    <div className="cs-barra">
                        <label className="cs-buscar">
                            <span className="sr-only">Buscar casas</span>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                            <input type="search" className="pg-entrada" placeholder="Ciudad, departamento o código"
                                value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                        </label>
                        <span className="cs-conteo" aria-live="polite">
                            {visibles.length} {visibles.length === 1 ? 'casa' : 'casas'}
                        </span>
                    </div>

                    {visibles.length === 0 ? (
                        <div className="cs-vacio">
                            <strong>{buscar ? 'Ninguna casa coincide con la búsqueda' : 'Todavía no hay casas publicadas'}</strong>
                            {buscar ? 'Prueba con otra ciudad, departamento o código.' : 'Publica la primera con el botón "Publicar casa".'}
                        </div>
                    ) : (
                        <ul className="cs-rejilla">
                            {visibles.map((house, i) => (
                                <li key={house._id} className="cs-casa" style={{ '--i': Math.min(i, 12) }} data-codigo={house.code}>
                                    <div className="cs-foto">
                                        {house.image ? (
                                            <img src={house.image} alt={`Foto de ${house.type || 'la casa'} en ${house.city}`} loading="lazy" />
                                        ) : (
                                            <div className="cs-foto-vacia" aria-hidden="true">
                                                <svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>
                                            </div>
                                        )}
                                        {house.type && <span className="cs-chip">{house.type}</span>}
                                    </div>
                                    <div className="cs-cuerpo">
                                        <p className="cs-precio">{precio(house.price)}</p>
                                        <p className="cs-direccion">{house.address}</p>
                                        <p className="cs-lugar">
                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                                            {house.city}, {house.state}
                                        </p>
                                        <div className="cs-datos">
                                            <span>{house.size} m²</span>
                                            {house.rooms != null && <span>{house.rooms} hab.</span>}
                                            {house.bathrooms != null && <span>{house.bathrooms} baños</span>}
                                            {house.parking && <span>{/^s/i.test(house.parking) ? 'Con parqueadero' : 'Sin parqueadero'}</span>}
                                        </div>
                                        <p className="cs-codigo">Código {house.code}</p>
                                        <div className="cs-acciones">
                                            <Link to={`/house/${house.code}`} className="pg-boton pg-boton--secundario" aria-label={`Editar casa ${house.code}`}>Editar</Link>
                                            <button type="button" className="pg-boton pg-boton--peligro" onClick={() => eliminar(house)} aria-label={`Eliminar casa ${house.code}`}>Eliminar</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
