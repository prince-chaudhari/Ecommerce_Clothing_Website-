import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userOrderApi = createApi({
    reducerPath: 'userOrderApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/orders/' }),
    endpoints: (builder) => ({
        addProductsToOrder: builder.mutation({
            query: ({ actualData, access_token }) => {
                return {
                    url: 'create/',
                    method: 'POST',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['AddOrderProduct'],
        }),
        getOrderProducts: builder.query({
            query: ({ access_token }) => {
                return {
                    url: '',
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            providesTags: ['AddOrderProduct'],
        }),
        getOrderProduct: builder.query({
            query: ({ order_id, access_token }) => {
                return {
                    url: `${order_id}/`,
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            providesTags: ['AddOrderProduct'],
        }),



    }),
})

export const { useAddProductsToOrderMutation, useGetOrderProductsQuery, useGetOrderProductQuery } = userOrderApi