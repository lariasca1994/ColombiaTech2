import { useNavigate, useParams } from 'react-router-dom'
import { useGetHouseByCodeQuery, useUpdateHouseMutation, useUploadHouseImageMutation } from '../../features/api/apiHousesSlice';
import Swal from 'sweetalert2'
import HouseForm from './HouseForm';
import { useState } from 'react';
import { AvisoError, Cargando } from '../ui/Pagina';

export default function HouseFormEdit(){

    const navigate = useNavigate(); // Instanciamos la vaiable de useNavigate
    const params = useParams(); // Instanciamos la variable para obtener los parametros por URL (el code de la casa)
    const [updateHouse] = useUpdateHouseMutation()
    const [uploadHouseImage] = useUploadHouseImageMutation();

    const [file, setFile] = useState(null);
    //const [uploadAvatar] = useUploadAvatarMutation();

    const handleChangeAvatar = (e) => {
        setFile(e.target.files)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();        
        const house = {
            code: params.id, // el code de la casa viene en la URL (ver HouseList.jsx)
            address: e.target.address.value,
            state: e.target.state.value.split("-")[1],
            city: e.target.city.value,
            zip_code: e.target.zip_code.value,
            size: e.target.size.value,
            type: e.target.type.value,
            rooms: e.target.rooms.value,
            bathrooms: e.target.bathrooms.value,
            parking: e.target.parking.value,
            price: e.target.price.value,
        }
        try {
            const response = await updateHouse(house)
            if (response.error) {
                const detail = response.error.data?.message
                const detailText = Array.isArray(detail) ? detail.join(' | ') : detail
                console.log('Error del backend:', response.error.data)
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "La casa no pudo ser actualizada",
                    text: detailText || "Por favor verifique los datos",
                    showConfirmButton: true,
                })
            }else{
                if(file){
                    const formData = new FormData();
                    formData.append("file", file[0])
                    uploadHouseImage({ code: params.id, file: formData })
                }
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Casa Actualizada Correctamente",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    navigate('/house') // Hacemos la redireccion
                });
            }
            
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "La casa no pudo ser actualizada, por favor verifique los datos de nuevo",
                showConfirmButton: false,
                timer: 1500,
                
              })
              console.log(error)
        }
    }

    /** Se ejecuta al cargar el componente */
    const { data: house, isLoading, isError, error } = useGetHouseByCodeQuery(params.id);
    if (isLoading) return <div className="pg"><Cargando texto="Cargando la casa…" /></div>;
    else if (isError) return <div className="pg"><AvisoError>No se pudo cargar la información. {error?.data?.message || ""}</AvisoError></div>        
        
    return (
        <HouseForm props={{handleSubmit:handleSubmit, handleChangeAvatar:handleChangeAvatar, onFileChange: null, house:house}} />
    );
}
