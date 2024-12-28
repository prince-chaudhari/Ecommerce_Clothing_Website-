import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userWishlistApi = createApi({
    reducerPath: 'userWishlistApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://ecommerce-clothing-website-v4ip.onrender.com/api/wishlist/' }),
    endpoints: (builder) => ({
        addProductToWishlist: builder.mutation({
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
            invalidatesTags: ['AddProductWishlist'],
        }),
        deleteProductWishlist: builder.mutation({
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
            invalidatesTags: ['DeleteProductWishlist'],
        }),
        getWishlistProducts: builder.query({
            query: ({access_token}) => {
                return {
                    url: '',
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            providesTags: ['AddProductWishlist', 'DeleteProductWishlist'],
        }),



    }),
})

export const { useAddProductToWishlistMutation, useDeleteProductWishlistMutation, useGetWishlistProductsQuery } = userWishlistApi