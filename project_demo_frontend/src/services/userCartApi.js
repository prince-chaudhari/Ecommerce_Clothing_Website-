import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userCartApi = createApi({
    reducerPath: 'userCartApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/cart/' }),
    endpoints: (builder) => ({

        getCartProducts: builder.query({
            query: ({ access_token }) => {
                return {
                    url: '',
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            providesTags: ['DeleteCartProduct', 'UpdateCartProduct', 'AddCartProduct', 'ClearCartProduct'],
        }),
        addProductToCart: builder.mutation({
            query: ({ actualData, access_token }) => {
                return {
                    url: 'add/',
                    method: 'POST',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['AddCartProduct'],
        }),
        updateProductCart: builder.mutation({
            query: ({ actualData, access_token }) => {
                return {
                    url: 'update/',
                    method: 'PATCH',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['UpdateCartProduct'],
        }),
        deleteProductCart: builder.mutation({
            query: ({ actualData, access_token }) => {
                return {
                    url: 'delete/',
                    method: 'DELETE',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['DeleteCartProduct'],
        }),
        clearProductCart: builder.mutation({
            query: ({ access_token }) => {
                return {
                    url: 'clear/',
                    method: 'DELETE',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['ClearCartProduct'],
        }),




    }),
})

export const { useAddProductToCartMutation, useGetCartProductsQuery, useUpdateProductCartMutation, useDeleteProductCartMutation, useClearProductCartMutation } = userCartApi