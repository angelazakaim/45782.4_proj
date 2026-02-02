// Register.tsx - User registration form
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./Register.css";
import { authService } from "../../../Services/AuthService";
import { notificationService } from "../../../Services/NotificationService";
import type { RegisterData } from "../../../Models/User";
import { UserRole } from "../../../Models/Enums";


export function Register() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterData>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Watch password for confirmation matching
    const password = watch("password");

    async function onSubmit(data: RegisterData) {
        setLoading(true);
        try {
            // Default role is customer
            const registrationData: RegisterData = {
                email: data.email,
                username: data.username,
                password: data.password,
                role: UserRole.CUSTOMER, // Always register as customer
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone
            };

            await authService.register(registrationData);
            
            notificationService.success("Registration successful! Please login.");
            navigate('/login');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Registration failed';
            notificationService.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="Register">
            <div className="register-container">
                <h2>Create Account</h2>
                <p className="subtitle">Join our supermarket today</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Account Information */}
                    <div className="form-section">
                        <h3>Account Information</h3>
                        
                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                placeholder="your.email@example.com"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && (
                                <span className="error-message">{errors.email.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">
                                Username <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                {...register('username', {
                                    required: 'Username is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Username must be at least 3 characters'
                                    },
                                    pattern: {
                                        value: /^[a-zA-Z0-9_-]+$/,
                                        message: 'Username can only contain letters, numbers, underscores, and hyphens'
                                    }
                                })}
                                placeholder="johndoe"
                                className={errors.username ? 'error' : ''}
                            />
                            {errors.username && (
                                <span className="error-message">{errors.username.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Password <span className="required">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    }
                                })}
                                placeholder="••••••••"
                                className={errors.password ? 'error' : ''}
                            />
                            {errors.password && (
                                <span className="error-message">{errors.password.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_confirm">
                                Confirm Password <span className="required">*</span>
                            </label>
                            <input
                                type="password"
                                id="password_confirm"
                                {...register('password_confirm', {
                                    required: 'Please confirm your password',
                                    validate: value => value === password || 'Passwords do not match'
                                })}
                                placeholder="••••••••"
                                className={errors.password_confirm ? 'error' : ''}
                            />
                            {errors.password_confirm && (
                                <span className="error-message">{errors.password_confirm.message}</span>
                            )}
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="form-section">
                        <h3>Personal Information (Optional)</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    {...register('first_name', {
                                        maxLength: {
                                            value: 50,
                                            message: 'First name too long'
                                        }
                                    })}
                                    placeholder="John"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    {...register('last_name', {
                                        maxLength: {
                                            value: 50,
                                            message: 'Last name too long'
                                        }
                                    })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                {...register('phone', {
                                    maxLength: {
                                        value: 20,
                                        message: 'Phone number too long'
                                    }
                                })}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>

                    <div className="form-footer">
                        <p>
                            Already have an account?{' '}
                            <NavLink to="/login" className="login-link">
                                Sign in here
                            </NavLink>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}