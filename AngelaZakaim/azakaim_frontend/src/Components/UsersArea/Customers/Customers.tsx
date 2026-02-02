// Customers.tsx - FIXED with all imports
import { NavLink, Navigate } from "react-router-dom";
import Pagination from "../../CommonArea/Pagination/Pagination";
import { usersService } from "../../../Services/UsersService";
import { useEffect, useState } from "react";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import type { CustomersResponse } from "../../../Models/User";
import "./Customers.css";

export function Customers() {
    const canView = useHasRole([UserRole.MANAGER, UserRole.ADMIN]);
    
    const [data, setData] = useState<CustomersResponse | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!canView) return;
        
        const loadCustomers = async () => {
            setLoading(true);
            try {
                const response = await usersService.getAllCustomers(page, 25);
                setData(response);
            } catch (err) {
                console.error("Failed to load customers:", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadCustomers();
    }, [page, canView]);
    
    // Protection: redirect non-managers
    if (!canView) {
        return <Navigate to="/" replace />;
    }
    
    if (loading) return <div className="loading">Loading customers...</div>;
    
    return (
        <div className="Customers">
            <header>
                <h2>👥 Customer Management</h2>
                <p>Total Customers: {data?.total || 0}</p>
            </header>
            
            <div className="customers-grid">
                {data?.customers.map(customer => (
                    <div key={customer.id} className="CustomerCard">
                        <div className="card-header">
                            <h3>{customer.full_name || "No name"}</h3>
                            {!customer.user.is_active && (
                                <span className="badge inactive">Banned</span>
                            )}
                        </div>
                        
                        <div className="card-body">
                            <p><strong>Email:</strong> {customer.user.email}</p>
                            <p><strong>Username:</strong> {customer.user.username}</p>
                            <p><strong>Phone:</strong> {customer.phone || "Not provided"}</p>
                            {customer.address.city && (
                                <p><strong>City:</strong> {customer.address.city}</p>
                            )}
                        </div>
                        
                        <div className="card-actions">
                            <NavLink to={`/users/${customer.user_id}`} className="btn-view">
                                View Details
                            </NavLink>
                        </div>
                    </div>
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
}