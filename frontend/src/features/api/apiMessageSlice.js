import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiMessageSlice = createApi({
    reducerPath: "messageApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: () => '/messages'
        }),
        createMessage: builder.mutation({
            query: (newMessage) => ({
                url: '/messages',
                method: 'POST',
                body: newMessage
            })
        })
    })
})

export const {
    useGetMessagesQuery,
    useCreateMessageMutation
} = apiMessageSlice
