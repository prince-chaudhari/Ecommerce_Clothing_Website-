// services/userSearchApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productSearchApi = createApi({
  reducerPath: 'productSearchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:8000/api/search/'
  }),
  endpoints: (builder) => ({
    createSearch: builder.mutation({
      query: (searchTerm) => ({
        url: '',
        method: 'POST',
        body: { query: searchTerm },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});

export const { useCreateSearchMutation } = productSearchApi;
