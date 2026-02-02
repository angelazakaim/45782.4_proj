// UserDetails.tsx - FIXED with all imports and proper navigation
import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { usersService } from "../../../Services/UsersService";
import { notificationService } from "../../../Services/NotificationService";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import type { UserWithProfile } from "../../../Models/User";
import type { Customer } from "../../../Models/Customer";
import type { Employee } from "../../../Models/Employee";
import { CustomerProfileDisplay } from "../../UsersArea/Customerprofiledisplay/Customerprofiledisplay";
import { EmployeeProfileDisplay } from "../../UsersArea/Employeeprofiledisplay/Employeeprofiledisplay";
import "./UserDetails.css";

export function UserDetails() {
    const isAdmin = useHasRole([UserRole.ADMIN]);
    const isManager = useHasRole([UserRole.MANAGER]);
    
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [data, setData] = useState<UserWithProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!isAdmin && !isManager) return;
        
        const loadUser = async () => {
            setLoading(true);
            try {
                const userdata = await usersService.getUserById(parseInt(id!));
                setData(userdata);
            } catch (err) {
                notificationService.error("Failed to load user");
                navigate('/users');
            } finally {
                setLoading(false);
            }
        };
        
        loadUser();
    }, [id, isAdmin, isManager, navigate]);
    
    // Protection
    if (!isAdmin && !isManager) {
        return <Navigate to="/" replace />;
    }
    
    const handleBan = async () => {
        if (!data) return;
        
        try {
            if (data.user.is_active) {
                await usersService.banUser(data.user.id);
                notificationService.success("User banned");
            } else {
                await usersService.unbanUser(data.user.id);
                notificationService.success("User unbanned");
            }
            
            // Reload user data
            const updated = await usersService.getUserById(data.user.id);
            setData(updated);
        } catch (err) {
            notificationService.error("Failed to update user status");
        }
    };
    
    const handleDelete = async () => {
        if (!data) return;
        
        if (confirm(`Delete user ${data.user.username}? This cannot be undone.`)) {
            try {
                await usersService.deleteUser(data.user.id);
                notificationService.success("User deleted");
                navigate('/users');
            } catch (err) {
                notificationService.error("Failed to delete user");
            }
        }
    };
    
    if (loading) return <div className="loading">Loading...</div>;
    if (!data) return <div>User not found</div>;
    
    return (
        <div className="UserDetails">
            <div className="user-header">
                <h2>👤 {data.user.username}</h2>
                <span className={`role-badge ${data.user.role}`}>
                    {data.user.role}
                </span>
            </div>
            
            <div className="user-account-info">
                <h3>Account Information</h3>
                <p><strong>Email:</strong> {data.user.email}</p>
                <p><strong>Username:</strong> {data.user.username}</p>
                <p><strong>Role:</strong> {data.user.role}</p>
                <p><strong>Status:</strong> 
                    {data.user.is_active ? (
                        <span className="status active"> Active</span>
                    ) : (
                        <span className="status inactive"> Banned</span>
                    )}
                </p>
                <p><strong>Created:</strong> {new Date(data.user.created_at).toLocaleDateString()}</p>
            </div>
            
            {/* Show profile based on role */}
            {data.user.role === 'customer' && data.profile && (
                <CustomerProfileDisplay profile={data.profile as Customer} />
            )}
            
            {(['manager', 'cashier'].includes(data.user.role)) && data.profile && (
                <EmployeeProfileDisplay profile={data.profile as Employee} showSalary={isAdmin} />
            )}
            
            {/* Actions */}
            <div className="user-actions">
                <button onClick={() => navigate(-1)} className="btn-back">
                    ← Back
                </button>
                
                {isManager && (
                    <button 
                        onClick={handleBan}
                        className={data.user.is_active ? "btn-ban" : "btn-unban"}
                    >
                        {data.user.is_active ? '🚫 Ban User' : '✅ Unban User'}
                    </button>
                )}
                
                {isAdmin && (
                    <button onClick={handleDelete} className="btn-delete">
                        🗑️ Delete User
                    </button>
                )}
            </div>
        </div>
    );
}