import { useState } from "react";
import { useLoginMutation, useUpdateUserMutation } from "../../features/api/apiSlice";
import { useSelector } from "react-redux";
import Swal from 'sweetalert2'

export default function ChangePassword() {

    const [newPassword, setNewPassword] = useState("")
    const [notEqualPassword, setNotEqualPassword] = useState(false)
    const [isError, setIsError] = useState(false)

    const handleChangeNewPassword = (e) => {
        setNewPassword(e.target.value)
    }

    const handleChangeRepeatNewPassword = (e) => {
        setNotEqualPassword(!(newPassword === e.target.value))
    }

    const user = useSelector((state) => state.auth.user);
    const [login] = useLoginMutation();
    const [updateUser] = useUpdateUserMutation()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsError(false)
        const userValidate = {
            email: user.email,
            password: e.target.password.value,
        }
        const response = await login(userValidate)
        if (response.error) {
            setIsError(true)
        } else {
            if (!notEqualPassword) {
                const newUser = {
                    _id: user._id,
                    password: e.target["new-password"].value
                }
                const response = await updateUser(newUser)
                if (response.error) {
                    const detail = response.error.data?.message
                    const detailText = Array.isArray(detail) ? detail.join(' | ') : detail
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Error actualizando la contraseña",
                        text: detailText || undefined,
                        showConfirmButton: true,
                    })
                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Contraseña actualizada Correctamente",
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            }
        }
    }

    return (
        <div className="max-w-lg w-full mx-auto px-5 py-5">
            <form onSubmit={handleSubmit} className="shadow-md rounded pt-6 pb-10 mb-4 px-10 bg-white dark:bg-gray-800">

                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="password">Current Password</label>
                    <input type="password"
                        required
                        minLength="3"
                        name="password"
                        placeholder="Password"
                        className="shadow appearance-none border rounded w-full focus:shadow-outline bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600" />
                    {isError ?
                        <span className="text-red-600 dark:text-red-400">La contraseña actual no es correcta</span>
                        : null}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="new-password">New Password</label>
                    <input type="password"
                        required
                        minLength="3"
                        name="new-password"
                        placeholder="New Password"
                        className="shadow appearance-none border rounded w-full focus:shadow-outline bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                        onChange={handleChangeNewPassword} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="repeat-newpassword">Repeat New Password</label>
                    <input type="password"
                        required
                        minLength="3"
                        name="repeat-new-password"
                        placeholder="Repeat New Password"
                        className="shadow appearance-none border rounded w-full focus:shadow-outline bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                        onChange={handleChangeRepeatNewPassword} />
                    {notEqualPassword ?
                        <span className="text-red-600 dark:text-red-400">Las contraseñas no coinciden</span>
                        : null}
                </div>
                <div className="flex justify-center">
                    <button type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 rounded text-white font-bold py-2 px-4">
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    );
}
