import store from "../Redux/store";
import { type UserRoleType } from "../Models/Enums"; 

/**
 * Checks if the current user has any of the required roles.
 * @param allowedRoles - An array of roles that are permitted (e.g., [UserRole.ADMIN, UserRole.MANAGER])
 */
export function useHasRole(allowedRoles: UserRoleType[]): boolean {
    const userRole = store.getState().authStore.user?.role;

    if (!userRole) return false;

    // We check if the user's role exists within the allowedRoles array
    return allowedRoles.includes(userRole as UserRoleType);
}