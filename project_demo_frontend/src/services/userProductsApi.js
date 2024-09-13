import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userProductsApi = createApi({
    reducerPath: 'userProductsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/' }),
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: () => {
                return {
                    url: '/',
                    method: 'GET',
                }
            },

        }),
        filterProducts: builder.mutation({
            query: (filters) => ({
                url: 'product/filter/', // Use a different endpoint for POST requests
                method: 'POST',
                body: filters, // Send filters as the body of the request
            }),
        }),
        getProduct: builder.query({
            query: ({ pid }) => {
                return {
                    url: `product/${pid}/`,
                    method: 'GET',
                }
            },

        }),
        getPriceRange: builder.query({
            query: () => {
                return {
                    url: `product/price-range/`,
                    method: 'GET',
                }
            },

        }),
        getColorList: builder.query({
            query: () => {
                return {
                    url: `colors/`,
                    method: 'GET',
                }
            },

        }),
        getSizeList: builder.query({
            query: () => {
                return {
                    url: `sizes/`,
                    method: 'GET',
                }
            },

        }),

    }),
})

export const { useGetProductsQuery, useFilterProductsMutation, useGetProductQuery, useGetPriceRangeQuery, useGetColorListQuery, useGetSizeListQuery } = userProductsApi