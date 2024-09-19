import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userReviewApi = createApi({
    reducerPath: 'userReviewApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/' }),
    endpoints: (builder) => ({
        addUserReview: builder.mutation({
            query: ({ product_id, actualData, access_token }) => {
                return {
                    url: `${product_id}/reviews/`,
                    method: 'POST',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['UserReview'],
        }),
        updateUserReview: builder.mutation({
            query: ({ product_id, review_id, actualData, access_token }) => {
                return {
                    url: `${product_id}/reviews/${review_id}/`,
                    method: 'PUT',
                    body: actualData,
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            }
        }),
        deleteUserReview: builder.mutation({
            query: ({ product_id, review_id, access_token }) => {
                return {
                    url: `${product_id}/reviews/${review_id}/`,
                    method: 'DELETE',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
            invalidatesTags: ['UserDeleteReview'],
        }),
        getUserReviews: builder.query({
            query: ({product_id, access_token}) => {
                return {
                    url: `${product_id}/reviews/`,
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${access_token}`,
                    }
                }
            },
        }),



    }),
})

export const { useAddUserReviewMutation, useDeleteUserReviewMutation, useGetUserReviewsQuery, useUpdateUserReviewMutation } = userReviewApi