import { usersService } from "../../../Services/UsersService";
import type { UsersResponse } from "../../../Models/User";
import { UserCard } from "../UserCard/UserCard";
import Pagination from "../../CommonArea/Pagination/Pagination";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const Users: React.FC = () => {

    const [data, setData] = useState<UsersResponse | null>(null);
    const [page, setPage] = useState<number>(1);
    const [roleFilter, setRoleFilter] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        setPage(1); // reset to page 1 whenever the filter changes
    }, [roleFilter]);

    useEffect(() => {
        const loadUsers = async () => {
            const response = await usersService.getAllUsers(page, 20, { role_filter: roleFilter });
            setData(response);
        };
        loadUsers();
    }, [page, roleFilter]);

    // Admin only
    const canView = useHasRole([UserRole.ADMIN]);

    // 1. Protection: If they shouldn't be here, kick them out or show a message
    if (!canView) {
        return <Navigate to="/" replace />;
        // OR: return <h2>Access Denied: Admins Only</h2>;
    }

    return (
        <div className="Users">
            <header>
                <h2>User Management</h2>
                <button onClick={() => navigate('/users/create')}>+ Create User</button>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="manager">Managers</option>
                    <option value="cashier">Cashiers</option>
                    <option value="customer">Customers</option>
                </select>
                <p>Total Users: {data?.total}</p>
            </header>

            {/* 
            <header>
                <h2>User Management</h2>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="manager">Managers</option>
                    <option value="cashier">Cashiers</option>
                    <option value="customer">Customers</option>
                </select>
                <p>Total Users: {data?.total}</p>
            </header> */}

            <div className="users-grid">
                {data?.users.map(u => (
                    <UserCard key={u.id} user={u} />
                ))}
            </div>

            {data && data.pages > 1 && (
                <Pagination
                    currentPage={data.current_page}
                    totalPages={data.pages}
                    hasNext={data.has_next}
                    hasPrev={data.has_prev}
                    onPageChange={(targetPage) => setPage(targetPage)}
                />
            )}
        </div>
    );
};