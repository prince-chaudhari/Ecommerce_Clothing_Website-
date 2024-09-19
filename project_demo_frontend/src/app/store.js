import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "../features/sidebarSlice";
import authReducer from '../features/authSlice'
import userReducer from '../features/userSlice'
import productFilterReducer from '../features/productFilterSlice'
import cartReducer from '../features/cartSlice'
import wishlistReducer from '../features/wishlistSlice'
import addressReducer from '../features/addressSlice'
import reviewReducer from '../features/reviewSlice'
import { userAuthApi } from '../services/userAuthApi'
import { userProductsApi } from '../services/userProductsApi'
import {userCategoriesApi} from '../services/userCategoriesApi'
import {userCartApi} from '../services/userCartApi'
import {userWishlistApi} from '../services/userWishlistApi'
import {userAddressApi} from '../services/userAddressApi'
import {userReviewApi} from '../services/userReviewApi'
import {userOrderApi} from '../services/userOrderApi'
import {productSearchApi} from '../services/productSearchApi'

export const store = configureStore({
  reducer: {
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [userProductsApi.reducerPath]: userProductsApi.reducer,
    [userCategoriesApi.reducerPath]: userCategoriesApi.reducer,
    [userCartApi.reducerPath]: userCartApi.reducer,
    [userWishlistApi.reducerPath]: userWishlistApi.reducer,
    [userAddressApi.reducerPath]: userAddressApi.reducer,
    [userReviewApi.reducerPath]: userReviewApi.reducer,
    [userOrderApi.reducerPath]: userOrderApi.reducer,
    [productSearchApi.reducerPath]: productSearchApi.reducer,
    auth: authReducer,
    user: userReducer,
    sidebar: sidebarReducer,
    productFilter: productFilterReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    address: addressReducer,
    review: reviewReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
      .concat(userAuthApi.middleware, userProductsApi.middleware, userCategoriesApi.middleware, userCartApi.middleware, userWishlistApi.middleware, userAddressApi.middleware, userReviewApi.middleware, userOrderApi.middleware, productSearchApi.middleware),
});
