import { createSlice } from "@reduxjs/toolkit"


const houses =[
{
"id":"212513121",
"id":45326262,
"name":"Mario",
"lastname":"Perez",
"email":"mario@correo.com",
"password":"216161561561156"

}

]

export const houseSlice = createSlice({

   name: 'Houses',
   initialState:houses,
   reducers: {
     addHouse:(state, action) => {
         state.push(action.payload)


     }
   

   }


})
export const {addHouse} = houseSlice.actions
export  default houseSlice.reducer;
