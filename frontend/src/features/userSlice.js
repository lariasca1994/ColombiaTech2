import { createSlice } from "@reduxjs/toolkit"


const users =[
{
"id":"212513121",
"id":45326262,
"name":"Mario",
"lastname":"Perez",
"email":"mario@correo.com",
"password":"216161561561156"

}

]

export const userSlice = createSlice({

   name: 'Users',
   initialState:users,
   reducers: {
     addUser:(state, action) => {
         state.push(action.payload)


     }
   

   }


})
export const {addUser} = userSlice.actions
export  default userSlice.reducer;
