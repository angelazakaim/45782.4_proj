// NavBar.tsx
import "./NavBar.css";
import { NavLink } from "react-router-dom";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import { useEffect, useState } from "react";
import store from "../../../Redux/store";

export function NavBar() {
    const [isLoggedIn, setLoggedIn] = useState<boolean>(!!store.getState().authStore.access_token);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setLoggedIn(!!store.getState().authStore.access_token);
        });
        return () => unsubscribe();
    }, []);

    const isAdmin   = useHasRole([UserRole.ADMIN]);
    const isManager = useHasRole([UserRole.MANAGER]);

    return (
        <nav className="NavBar">
            <NavLink to='/home'>Home</NavLink>
            <NavLink to='/products'>Products</NavLink>
            <NavLink to='/categories'>Categories</NavLink>

            {/* ADMIN: Admin Panel + sub-links */}
            {isAdmin && (
                <NavLink to='/users'>Admin Panel</NavLink>
            )}

            {isAdmin && (
                <>
                    <NavLink to='/customers'>Customers</NavLink>
                    <NavLink to='/employees'>Employees</NavLink>
                </>
            )}

            {/* Orders link — label changes by role */}
            {isLoggedIn && (
                <NavLink to='/orders'>
                    {(isAdmin || isManager) ? "Orders" : "My Orders"}
                </NavLink>
            )}

            {/* Everyone logged in: My Profile */}
            {isLoggedIn && (
                <NavLink to='/profile'>My Profile</NavLink>
            )}

            <NavLink to='/about'>About Us</NavLink>
        </nav>
    );
}