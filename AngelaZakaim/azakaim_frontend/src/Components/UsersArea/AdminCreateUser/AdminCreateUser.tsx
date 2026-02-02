// AdminCreateUser.tsx - Admin creates users of any role
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Navigate } from "react-router-dom";
import { authService } from "../../../Services/AuthService";
import { notificationService } from "../../../Services/NotificationService";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import type { RegisterData } from "../../../Models/User";
import "./AdminCreateUser.css";

export function AdminCreateUser() {
    const isAdmin = useHasRole([UserRole.ADMIN]);
    const navigate = useNavigate();
    
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterData>();
    const [loading, setLoading] = useState(false);
    
    const selectedRole = watch("role", "customer");
    const password = watch("password");
    const isEmployee = selectedRole === 'manager' || selectedRole === 'cashier';
    
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }
    
    async function onSubmit(data: RegisterData) {
        setLoading(true);
        try {
            await authService.register(data);
            notificationService.success(`${data.role} created successfully!`);
            navigate('/users');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to create user';
            notificationService.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="AdminCreateUser">
            <div className="create-container">
                <h2>Create New User</h2>
                <p className="subtitle">Admin can create users with any role</p>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Account Information */}
                    <div className="form-section">
                        <h3>Account Information</h3>
                        
                        <div className="form-group">
                            <label>Email <span className="required">*</span></label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                placeholder="user@example.com"
                            />
                            {errors.email && <span className="error">{errors.email.message}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label>Username <span className="required">*</span></label>
                            <input
                                type="text"
                                {...register('username', {
                                    required: 'Username is required',
                                    minLength: { value: 3, message: 'Min 3 characters' }
                                })}
                                placeholder="username"
                            />
                            {errors.username && <span className="error">{errors.username.message}</span>}
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Password <span className="required">*</span></label>
                                <input
                                    type="password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Min 8 characters' }
                                    })}
                                    placeholder="••••••••"
                                />
                                {errors.password && <span className="error">{errors.password.message}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label>Confirm Password <span className="required">*</span></label>
                                <input
                                    type="password"
                                    {...register('password_confirm', {
                                        required: 'Please confirm password',
                                        validate: value => value === password || 'Passwords do not match'
                                    })}
                                    placeholder="••••••••"
                                />
                                {errors.password_confirm && (
                                    <span className="error">{errors.password_confirm.message}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Role <span className="required">*</span></label>
                            <select {...register('role', { required: 'Role is required' })}>
                                <option value="customer">Customer</option>
                                <option value="cashier">Cashier</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && <span className="error">{errors.role.message}</span>}
                        </div>
                    </div>
                    
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" {...register('first_name')} placeholder="John" />
                            </div>
                            
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" {...register('last_name')} placeholder="Doe" />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Phone</label>
                            <input type="tel" {...register('phone')} placeholder="+1 (555) 123-4567" />
                        </div>
                    </div>
                    
                    {/* Employee-specific fields */}
                    {isEmployee && (
                        <div className="form-section employee-section">
                            <h3>Employee Information</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Employee ID</label>
                                    <input 
                                        type="text" 
                                        {...register('employee_id')} 
                                        placeholder="EMP001" 
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Hire Date</label>
                                    <input type="date" {...register('hire_date')} />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Salary (Optional - Admin only)</label>
                                <input 
                                    type="number" 
                                    {...register('salary')} 
                                    placeholder="50000" 
                                />
                                <small>Leave empty if not setting now</small>
                            </div>
                        </div>
                    )}
                    
                    {/* Address */}
                    <div className="form-section">
                        <h3>Address (Optional)</h3>
                        
                        <div className="form-group">
                            <label>Address Line 1</label>
                            <input 
                                type="text" 
                                {...register('address_line1')} 
                                placeholder="123 Main St" 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Address Line 2</label>
                            <input 
                                type="text" 
                                {...register('address_line2')} 
                                placeholder="Apt 4B" 
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" {...register('city')} placeholder="Boston" />
                            </div>
                            
                            <div className="form-group">
                                <label>State</label>
                                <input type="text" {...register('state')} placeholder="MA" />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input type="text" {...register('postal_code')} placeholder="02101" />
                            </div>
                            
                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" {...register('country')} placeholder="USA" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/users')} 
                            className="btn-cancel"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}