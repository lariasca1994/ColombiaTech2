import { useNavigate } from 'react-router-dom'
import { useCreateUserMutation, useUploadAvatarMutation } from '../../features/api/apiSlice';
import Swal from 'sweetalert2'
import UserForm from './UserForm';
import { useState } from 'react';

export default function UserFormCreate(){

    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [createUser] = useCreateUserMutation()
    const [uploadAvatar] = useUploadAvatarMutation();

    const handleChangeAvatar = (e)=> {
        setFile(e.target.files)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newUser = {
            name: e.target.name.value,
            lastname: e.target.lastname.value,
            email: e.target.email.value,
            password: e.target.password.value,
        }
        try {
            const response = await createUser(newUser)
            if (response.error) {
                const detail = response.error.data?.message
                const detailText = Array.isArray(detail) ? detail.join(' | ') : detail
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "El usuario no pudo ser registrado",
                    text: detailText || "Por favor verifique los datos",
                    showConfirmButton: true,
                })
            } else {
                if (file) {
                    const formData = new FormData();
                    formData.append("file", file[0])
                    uploadAvatar({ _id: response.data._id, file: formData })
                }
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Usuario Creado Correctamente",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    navigate('/')
                });
            }
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <UserForm props={{ handleChangeAvatar:handleChangeAvatar,   handleSubmit: handleSubmit, user:null}} />
    );
}