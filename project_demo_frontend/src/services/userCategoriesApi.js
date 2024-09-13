import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userCategoriesApi = createApi({
    reducerPath: 'userCategoriesApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/category/' }),
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