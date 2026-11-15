import { useNavigate, useParams } from 'react-router-dom'
import { useGetUserByIdQuery, useUpdateUserMutation, useUploadAvatarMutation } from '../../features/api/apiSlice';
import Swal from 'sweetalert2'
import UserForm from './UserForm';
import { useState } from 'react';
import { AvisoError, Cargando } from '../ui/Pagina';

export default function UserFormEdit(){

    const navigate = useNavigate(); // Instanciamos la vaiable de useNavigate
    const params = useParams(); // Instanciamos la variable para obtener los parametros por URL
    const [updateUser] = useUpdateUserMutation()

    const [file, setFile] = useState(null);
    const [uploadAvatar] = useUploadAvatarMutation();

    const handleChangeAvatar = (e) => {
        setFile(e.target.files)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();        
        const user = {
            _id: params.id, // Seteamos en _id por el que me llega como parametro
            name: e.target.name.value,
            lastname: e.target.lastname.value,
            email: e.target.email.value,
        }
        try {
            const response = await updateUser(user)
            if(file){
                const formData = new FormData();
                formData.append("file", file[0])
                uploadAvatar({_id: params.id, file: formData})
            }
            if(response.error){
                const detail = response.error.data?.message
                const detailText = Array.isArray(detail) ? detail.join(' | ') : detail
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "El usuario no pudo ser actualizado",
                    text: detailText || "Por favor verifique los datos",
                    showConfirmButton: true,
                  })
            }else{                     
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Usuario Actualizado Correctamente",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    navigate('/house')
                });
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "El usuario no pudo ser actualizado, por favor verifique los datos",
                showConfirmButton: false,
                timer: 1500
              })
        }
    }

    /** Se ejecuta al cargar el componente */
    const { data: user, isLoading, isError, error } = useGetUserByIdQuery(params.id);
    if (isLoading) return <div className="pg"><Cargando texto="Cargando tu perfil…" /></div>;
    else if (isError) return <div className="pg"><AvisoError>No se pudo cargar la información. {error?.data?.message || ""}</AvisoError></div>        
        
    return (
        <UserForm props={{handleSubmit:handleSubmit, handleChangeAvatar:handleChangeAvatar, onFileChange: null, user:user}} />
    );
}