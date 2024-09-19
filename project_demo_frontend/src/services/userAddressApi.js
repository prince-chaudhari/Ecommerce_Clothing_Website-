import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userAddressApi = createApi({
    reducerPath: 'userAddressApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/address/' }),
    endpoints: (builder) => ({
        addUserAddress: builder.mutation({
            query: ({ actualData, access_token }) => {
                return {
                    url: 'create/',
                    method: 'POST',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            }
        }),
        deleteUserAddress: builder.mutation({
            query: ({ address_id, access_token }) => {
                return {
                    url: `remove/${address_id}/`,
                    method: 'DELETE',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['UserAddress'],
        }),
        updateUserAddress: builder.mutation({
            query: ({ address_id, actualData, access_token }) => {
                return {
                    url: `update/${address_id}/`,
                    method: 'PUT',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            }
        }),
        getUserAdress: builder.query({
            query: ({access_token}) => {
                return {
                    url: '',
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            providesTags: ['UserAddress'],
        }),



    }),
})

export const { useAddUserAddressMutation, useGetUserAdressQuery, useDeleteUserAddressMutation, useUpdateUserAddressMutation } = userAddressApi