// Employees.tsx - Manager view of employees (managers + cashiers)
import { useEffect, useState } from "react";
import { Navigate, NavLink } from "react-router-dom";
import { usersService } from "../../../Services/UsersService";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import type { EmployeesResponse } from "../../../Models/User";
import Pagination from "../../CommonArea/Pagination/Pagination";
import "./Employees.css";

export function Employees() {
    const canView = useHasRole([UserRole.MANAGER, UserRole.ADMIN]);
    
    const [data, setData] = useState<EmployeesResponse | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>(''); // 'manager' or 'cashier'
    
    useEffect(() => {
        if (!canView) return;

        const loadEmployees = async () => {
            setLoading(true);
            try {
                const response = await usersService.getAllUsers(page, 25, { role_filter: roleFilter || undefined });
                // Map UsersResponse to EmployeesResponse format
                const employeesData: EmployeesResponse = {
                    employees: response.users,
                    total: response.total,
                    pages: response.pages,
                    current_page: response.current_page,
                    per_page: response.per_page,
                    has_next: response.has_next,
                    has_prev: response.has_prev
                };
                setData(employeesData);
            } catch (err) {
                console.error("Failed to load employees:", err);
            } finally {
                setLoading(false);
            }
        };

        loadEmployees();
    }, [page, roleFilter, canView]);
    
    if (!canView) {
        return <Navigate to="/" replace />;
    }
    
    const filteredEmployees = data?.employees.filter(employee =>
        employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    if (loading) return <div className="loading">Loading employees...</div>;
    
    return (
        <div className="Employees">
            <header className="employees-header">
                <h2>👔 Employee Management</h2>
                
                <div className="controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="clear-search"
                            >
                                ✖
                            </button>
                        )}
                    </div>
                    
                    <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="role-filter"
                    >
                        <option value="">All Employees</option>
                        <option value="manager">Managers</option>
                        <option value="cashier">Cashiers</option>
                    </select>
                </div>
                
                <p className="total-count">
                    Total Employees: {data?.total || 0}
                    {searchTerm && ` (Showing ${filteredEmployees.length})`}
                </p>
            </header>
            
            {filteredEmployees.length === 0 ? (
                <div className="no-results">
                    <p>No employees found.</p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="btn-clear">
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="employees-grid">
                        {filteredEmployees.map(employee => (
                            <div key={employee.id} className="EmployeeCard">
                                <div className="card-header">
                                    <h3>{employee.username}</h3>
                                    <div className="badges">
                                        <span className={`role-badge ${employee.role}`}>
                                            {employee.role}
                                        </span>
                                        {!employee.is_active && (
                                            <span className="status-badge inactive">Banned</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="card-body">
                                    <p><strong>Email:</strong> {employee.email}</p>
                                    <p><strong>Status:</strong> 
                                        {employee.is_active ? (
                                            <span className="status active"> Active</span>
                                        ) : (
                                            <span className="status inactive"> Banned</span>
                                        )}
                                    </p>
                                </div>
                                
                                <div className="card-footer">
                                    <span className="joined-date">
                                        Joined {new Date(employee.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div className="card-actions">
                                    <NavLink to={`/users/${employee.id}`} className="btn-view">
                                        View Details →
                                    </NavLink>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {data && data.pages > 1 && !searchTerm && (
                        <Pagination 
                            currentPage={data.current_page}
                            totalPages={data.pages}
                            hasNext={data.has_next}
                            hasPrev={data.has_prev}
                            onPageChange={(targetPage) => setPage(targetPage)}
                        />
                    )}
                </>
            )}
        </div>
    );
}