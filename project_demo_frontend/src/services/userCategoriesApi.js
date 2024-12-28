import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userCategoriesApi = createApi({
    reducerPath: 'userCategoriesApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://ecommerce-clothing-website-v4ip.onrender.com/api/category/' }),
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => {
                return {
                    url: '',
                    method: 'GET',
                }
            },
            
        }),
        

    }),
})

export const { useGetCategoriesQuery } = userCategoriesApi