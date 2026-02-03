// UserProfile.tsx - FIXED with all imports
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { notificationService } from "../../../Services/NotificationService";
import { usersService } from "../../../Services/UsersService";
import type { UserWithProfile, ProfileUpdateData } from "../../../Models/User";
import type { Customer } from "../../../Models/Customer";
import type { Employee } from "../../../Models/Employee";
import { CustomerProfileDisplay } from "../CustomerProfileDisplay/CustomerProfileDisplay";
import { EmployeeProfileDisplay } from "../EmployeeProfileDisplay/EmployeeProfileDisplay";
import store from "../../../Redux/store";
import "./UserProfile.css";

export function UserProfile() {
    const isLoggedIn = !!store.getState().authStore.access_token;
    
    const [data, setData] = useState<UserWithProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const { register, handleSubmit, reset } = useForm<ProfileUpdateData>();
    
    useEffect(() => {
        if (!isLoggedIn) return;
        
        const loadProfile = async () => {
            setLoading(true);
            try {
                const profile = await usersService.getOwnProfile();
                setData(profile);
                
                // Set form defaults
                if (profile.profile) {
                    reset({
                        first_name: (profile.profile as any).first_name || '',
                        last_name: (profile.profile as any).last_name || '',
                        phone: (profile.profile as any).phone || '',
                        address_line1: (profile.profile as any).address?.line1 || '',
                        address_line2: (profile.profile as any).address?.line2 || '',
                        city: (profile.profile as any).address?.city || '',
                        state: (profile.profile as any).address?.state || '',
                        postal_code: (profile.profile as any).address?.postal_code || '',
                        country: (profile.profile as any).address?.country || ''
                    });
                }
            } catch (err) {
                notificationService.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        
        loadProfile();
    }, [isLoggedIn, reset]);
    
    const handleUpdate = async (formData: ProfileUpdateData) => {
        try {
            await usersService.updateOwnProfile(formData);
            notificationService.success('Profile updated!');
            setEditing(false);
            
            // Reload profile
            const updated = await usersService.getOwnProfile();
            setData(updated);
        } catch (err) {
            notificationService.error("Failed to update profile");
        }
    };
    
    // Protection
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    if (loading) return <div className="loading">Loading profile...</div>;
    if (!data) return <div>Profile not found</div>;
    
    return (
        <div className="UserProfile">
            <div className="profile-header">
                <h2>My Profile</h2>
            </div>
            
            <div className="account-info">
                <h3>Account Information</h3>
                <p><strong>Email:</strong> {data.user.email}</p>
                <p><strong>Username:</strong> {data.user.username}</p>
                <p><strong>Role:</strong> {data.user.role}</p>
            </div>
            
            {/* Show current profile */}
            {!editing && data.profile && (
                <>
                    {data.user.role === 'customer' && (
                        <CustomerProfileDisplay profile={data.profile as Customer} />
                    )}
                    
                    {(['manager', 'cashier'].includes(data.user.role)) && (
                        <EmployeeProfileDisplay profile={data.profile as Employee} showSalary={false} />
                    )}
                    
                    <button onClick={() => setEditing(true)} className="btn-edit">
                        ✏️ Edit Profile
                    </button>
                </>
            )}
            
            {/* Edit form */}
            {editing && (
                <form onSubmit={handleSubmit(handleUpdate)} className="edit-form">
                    <h3>Edit Profile Information</h3>
                    
                    <div className="form-group">
                        <label>First Name</label>
                        <input type="text" {...register('first_name')} />
                    </div>
                    
                    <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" {...register('last_name')} />
                    </div>
                    
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" {...register('phone')} />
                    </div>
                    
                    <h4>Address</h4>
                    
                    <div className="form-group">
                        <label>Address Line 1</label>
                        <input type="text" {...register('address_line1')} />
                    </div>
                    
                    <div className="form-group">
                        <label>Address Line 2</label>
                        <input type="text" {...register('address_line2')} />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input type="text" {...register('city')} />
                        </div>
                        
                        <div className="form-group">
                            <label>State</label>
                            <input type="text" {...register('state')} />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Postal Code</label>
                            <input type="text" {...register('postal_code')} />
                        </div>
                        
                        <div className="form-group">
                            <label>Country</label>
                            <input type="text" {...register('country')} />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="submit" className="btn-save">💾 Save Changes</button>
                        <button type="button" onClick={() => setEditing(false)} className="btn-cancel">
                            ✖️ Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}