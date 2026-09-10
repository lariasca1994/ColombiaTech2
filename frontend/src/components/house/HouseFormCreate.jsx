import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useState } from 'react';
import { useCreateHouseMutation, useUploadHouseImageMutation } from '../../features/api/apiHousesSlice';
import HouseForm from './HouseForm';

export default function HouseFormCreate(){

    const navigate = useNavigate(); // Instanciamos la vaiable de useNavigate
    const [createHouse] = useCreateHouseMutation()
    const [uploadHouseImage] = useUploadHouseImageMutation();
    
    const [file, setFile] = useState(null);

    const handleChangeAvatar = (e) => {
        setFile(e.target.files)
    }
  
    const handleSubmit = async (e) => {
        e.preventDefault();     
        
        if (!e || !e.target) {
            console.error("Evento o e.target es nulo o indefinido.");
            return;
        }

        const newHouse = {
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
            code: e.target.code.value,
        }
        
        try {
            const response = await createHouse(newHouse)
            if (response.error) {
                const detail = response.error.data?.message
                const detailText = Array.isArray(detail) ? detail.join(' | ') : detail
                console.log('Error del backend:', response.error.data)
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "La casa no pudo ser registrada",
                    text: detailText || "Por favor verifique los datos",
                    showConfirmButton: true,
                })
            }else{
                if(file){
                    const formData = new FormData();
                    formData.append("file", file[0])
                    uploadHouseImage({ code: response.data.code, file: formData })
                }
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Casa Creada Correctamente",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    navigate('/house') // Hacemos la redireccion
                });
            }
        } catch (error) {
            console.log(error)
        }
        
    }

    return (
        <HouseForm props={{handleSubmit: handleSubmit, 
                        handleChangeAvatar: handleChangeAvatar, 
                        house:null}} />
    );
}
