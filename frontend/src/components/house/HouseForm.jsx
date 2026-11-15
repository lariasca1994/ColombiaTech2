import { useEffect, useState } from "react";
import { useLazyGetCitiesByDepartmentQuery, useGetDepartmentsQuery } from "../../features/api/apiColombiaSlice";
import { AvisoError, CabeceraPagina, Campo, Cargando, Tarjeta, ZonaImagen } from "../ui/Pagina";

/** Formulario de casa, el mismo para publicar y para editar.
 *  Los name de los campos se conservan: los usan las pruebas E2E. */
export default function HouseForm({ props }) {
    const { handleSubmit, handleChangeAvatar, house } = props;
    const editando = Boolean(house);

    const { data: departments, isLoading, isError } = useGetDepartmentsQuery();
    const [getCities] = useLazyGetCitiesByDepartmentQuery();
    const [cities, setCities] = useState([]);
    const [cargandoCiudades, setCargandoCiudades] = useState(false);

    const cargarCiudades = async (valor) => {
        setCities([]);
        if (!valor) return;
        setCargandoCiudades(true);
        const response = await getCities(valor.split("-")[0]);
        setCities(response.data || []);
        setCargandoCiudades(false);
    };

    // Al editar, el departamento guardado es solo el nombre: se busca su id para cargar las ciudades.
    const deptoGuardado = editando && departments ? departments.find((d) => d.name === house.state) : null;
    const valorDepto = deptoGuardado ? `${deptoGuardado.id}-${deptoGuardado.name}` : "";
    useEffect(() => { if (valorDepto) cargarCiudades(valorDepto); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [valorDepto]);

    if (isLoading) return <div className="pg"><Cargando texto="Cargando el formulario…" /></div>;

    return (
        <div className="pg pg--angosta">
            <CabeceraPagina antetitulo="Casas" titulo={editando ? `Editar casa ${house.code}` : "Publicar una casa"}
                descripcion={editando ? "Actualiza los datos y guarda los cambios." : "Completa los datos de la vivienda. Los campos se validan antes de guardar."} />
            {isError && <AvisoError>No se pudo cargar la lista de departamentos. Intenta de nuevo en un momento.</AvisoError>}

            <form onSubmit={handleSubmit}>
                <Tarjeta titulo="Ubicación" descripcion="Dirección, departamento y ciudad donde está la vivienda.">
                    <div className="pg-rejilla">
                        <Campo id="address" etiqueta="Dirección" ancho="completo">
                            <input id="address" type="text" required name="address" placeholder="Ej.: Calle 100 # 15-20"
                                defaultValue={house?.address} className="pg-entrada" autoComplete="street-address" />
                        </Campo>
                        <Campo id="state" etiqueta="Departamento">
                            <select id="state" name="state" required key={valorDepto} defaultValue={valorDepto}
                                onChange={(e) => cargarCiudades(e.target.value)} className="pg-entrada">
                                <option value="">Selecciona un departamento</option>
                                {(departments || []).map((d) => (
                                    <option key={d.id} value={`${d.id}-${d.name}`}>{d.name}</option>
                                ))}
                            </select>
                        </Campo>
                        <Campo id="city" etiqueta="Ciudad" ayuda={cargandoCiudades ? "Cargando ciudades…" : cities.length ? null : "Primero elige el departamento."}>
                            <select id="city" name="city" required key={`${valorDepto}-${cities.length}`} defaultValue={house?.city || ""}
                                disabled={!cities.length} className="pg-entrada">
                                <option value="">Selecciona la ciudad</option>
                                {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </Campo>
                        <Campo id="zip_code" etiqueta="Código postal">
                            <input id="zip_code" type="text" required name="zip_code" inputMode="numeric" placeholder="Ej.: 110111"
                                defaultValue={house?.zip_code} className="pg-entrada" autoComplete="postal-code" />
                        </Campo>
                    </div>
                </Tarjeta>

                <Tarjeta titulo="Características" descripcion="Tamaño, tipo y distribución.">
                    <div className="pg-rejilla">
                        <Campo id="type" etiqueta="Tipo de vivienda">
                            <input id="type" type="text" required name="type" placeholder="Ej.: Apartamento" list="tipos-vivienda"
                                defaultValue={house?.type} className="pg-entrada" />
                            <datalist id="tipos-vivienda">
                                <option value="Apartamento" /><option value="Casa" /><option value="Apartaestudio" /><option value="Finca" />
                            </datalist>
                        </Campo>
                        <Campo id="size" etiqueta="Área (m²)">
                            <input id="size" type="number" step="any" min="1" required name="size" placeholder="Ej.: 80"
                                defaultValue={house?.size} className="pg-entrada" />
                        </Campo>
                        <Campo id="rooms" etiqueta="Habitaciones">
                            <input id="rooms" type="number" min="0" required name="rooms" placeholder="Ej.: 3"
                                defaultValue={house?.rooms} className="pg-entrada" />
                        </Campo>
                        <Campo id="bathrooms" etiqueta="Baños">
                            <input id="bathrooms" type="number" min="0" required name="bathrooms" placeholder="Ej.: 2"
                                defaultValue={house?.bathrooms} className="pg-entrada" />
                        </Campo>
                        <Campo id="parking" etiqueta="Parqueadero">
                            <select id="parking" name="parking" required defaultValue={house?.parking || ""} className="pg-entrada">
                                <option value="">Selecciona</option>
                                <option value="Si">Sí</option>
                                <option value="No">No</option>
                            </select>
                        </Campo>
                    </div>
                </Tarjeta>

                <Tarjeta titulo="Precio, código y foto">
                    <div className="pg-rejilla">
                        <Campo id="price" etiqueta="Precio (COP)">
                            <input id="price" type="number" step="any" min="0" required name="price" placeholder="Ej.: 250000000"
                                defaultValue={house?.price} className="pg-entrada" />
                        </Campo>
                        <Campo id="code" etiqueta="Código de la casa" ayuda={editando ? "El código no se puede cambiar." : "Identifica la casa; debe ser único."}>
                            <input id="code" type="text" required name="code" placeholder="Ej.: APT-100"
                                defaultValue={house?.code} readOnly={editando} className="pg-entrada" />
                        </Campo>
                        <div className="pg-campo pg-campo--completo">
                            <ZonaImagen id="image" nombre="image" etiqueta="Agregar foto de la casa" imagenActual={house?.image} onChange={handleChangeAvatar} />
                        </div>
                    </div>
                    <div className="pg-pie-form">
                        <button type="submit" className="pg-boton bg-emerald-600 hover:bg-emerald-700 text-white">
                            {editando ? "Guardar cambios" : "Guardar"}
                        </button>
                    </div>
                </Tarjeta>
            </form>
        </div>
    );
}
