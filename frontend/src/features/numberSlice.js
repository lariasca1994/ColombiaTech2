import { createSlice } from "@reduxjs/toolkit";

const numberSlice = createSlice({

    name: 'number',
    initialState: {
        value: 0
    },
    reducers: {
        increaseNumber: (state) => {
            state.value += 1;
        },
        decreaseNumber: (state) => {
            state.value -= 1
        }
    }

})

export const { increaseNumber, decreaseNumber } = numberSlice.actions;
export default numberSlice.reducer;