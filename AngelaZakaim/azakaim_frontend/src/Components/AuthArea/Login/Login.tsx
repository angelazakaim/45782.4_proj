// Login.tsx - including registration link
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import "./Login.css";
import { authService } from "../../../Services/AuthService";
import { notificationService } from "../../../Services/NotificationService";
import { useNavigate } from "react-router-dom";
import type { CredentialsModel } from "../../../Models/CredentialsModel";

export function Login() {

    const { register, handleSubmit } = useForm<CredentialsModel>();
    const navigate = useNavigate();

    function signIn(creds: CredentialsModel) {
        // try to sign in
        authService.login(creds)
            .then(user => {
                notificationService.success('Welcome back ' + user.username);
                navigate(-1);
            })
            .catch(err => notificationService.error(err))
    }

    return (
        <div className="Login">
            <div className="login-container">
                <h2>Sign In</h2>
                <p className="subtitle">Welcome back to our supermarket</p>

                <form onSubmit={handleSubmit(signIn)}>
                    <div className="form-group">
                        <label htmlFor="email_or_username">Username or Email</label>
                        <input 
                            type="text" 
                            id="email_or_username"
                            {...register('email_or_username', {
                                required: 'Username or email is required'
                            })} 
                            placeholder="Enter your username or email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            {...register('password', {
                                required: 'Password is required'
                            })} 
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn-submit">Sign In</button>
                </form>

                <div className="form-footer">
                    <p>
                        Don't have an account?{' '}
                        <NavLink to="/register" className="register-link">
                            Create one here
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
}