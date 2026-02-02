import { configureStore } from "@reduxjs/toolkit";
import { usersSlice } from "./UsersSlice";
import { authSlice } from "./AuthSlice";
import { cartsSlice } from "./CartsSlice";

export default configureStore({
    reducer: {
        userStore: usersSlice.reducer,
        authStore: authSlice.reducer,
        cartStore: cartsSlice.reducer
    }
})

