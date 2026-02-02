// forceLoggedInHook.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../Services/NotificationService";
import type { UserRoleType } from "../Models/Enums";
import store from "../Redux/store";

/**
 * Guard hook — redirects unauthenticated visitors to /login.
 * Optionally restricts access to specific roles.
 *
 * @param message       Toast shown when the user is not logged in.
 * @param allowedRoles  When provided, a logged-in user whose role is not
 *                      in this list is redirected to /home.
 * @param deniedMessage Toast shown on that role-denied redirect.
 */
export function useForceLoggedUser(
    message: string = "Please log in to access this page",
    allowedRoles?: UserRoleType[],
    deniedMessage: string = "You don't have permission to access this page"
) {
    const navigate = useNavigate();

    useEffect(() => {
        const { access_token, user } = store.getState().authStore;

        // ── not logged in → login page ──────────────────────────────
        if (!access_token) {
            notificationService.error(message);
            navigate("/login");
            return;
        }

        // ── logged in but wrong role → home ─────────────────────────
        if (allowedRoles && user && !allowedRoles.includes(user.role as UserRoleType)) {
            notificationService.error(deniedMessage);
            navigate("/home");
        }
    }, [navigate, message, allowedRoles, deniedMessage]);
}