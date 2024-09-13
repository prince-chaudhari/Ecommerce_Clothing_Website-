import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "../features/sidebarSlice";
import authReducer from '../features/authSlice'
import userReducer from '../features/userSlice'
import productFilterReducer from '../features/productFilterSlice'
import { userAuthApi } from '../services/userAuthApi'
import { userProductsApi } from '../services/userProductsApi'
import {userCategoriesApi} from '../services/userCategoriesApi'

export const store = configureStore({
  reducer: {
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [userProductsApi.reducerPath]: userProductsApi.reducer,
    [userCategoriesApi.reducerPath]: userCategoriesApi.reducer,
    auth: authReducer,
    user: userReducer,
    sidebar: sidebarReducer,
    productFilter: productFilterReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
      .concat(userAuthApi.middleware, userProductsApi.middleware, userCategoriesApi.middleware),
});
