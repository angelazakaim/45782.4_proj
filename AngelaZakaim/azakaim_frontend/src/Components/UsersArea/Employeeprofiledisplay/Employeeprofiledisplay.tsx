// EmployeeProfileDisplay.tsx - Display employee profile information
import type { Employee } from "../../../Models/Employee";
import "./EmployeeProfileDisplay.css";

interface EmployeeProfileDisplayProps {
    profile: Employee;
    showSalary?: boolean; // Admin can choose to show salary
}

export function EmployeeProfileDisplay({ profile, showSalary = false }: EmployeeProfileDisplayProps) {
    return (
        <div className="EmployeeProfileDisplay">
            <h3>Employee Profile</h3>
            
            <div className="profile-section">
                <h4>Personal Information</h4>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Full Name:</span>
                        <span className="value">{profile.full_name}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Employee ID:</span>
                        <span className="value">{profile.employee_id || 'Not assigned'}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Phone:</span>
                        <span className="value">{profile.phone || 'Not provided'}</span>
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <h4>Employment Details</h4>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Hire Date:</span>
                        <span className="value">
                            {profile.hire_date 
                                ? new Date(profile.hire_date).toLocaleDateString()
                                : 'Not specified'
                            }
                        </span>
                    </div>
                    {profile.shift_start && (
                        <div className="info-item">
                            <span className="label">Shift:</span>
                            <span className="value">
                                {profile.shift_start} - {profile.shift_end}
                            </span>
                        </div>
                    )}
                    {showSalary && profile.salary && (
                        <div className="info-item">
                            <span className="label">Salary:</span>
                            <span className="value">${profile.salary.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-section">
                <h4>Address</h4>
                {profile.address.line1 ? (
                    <div className="address-display">
                        <p>{profile.address.line1}</p>
                        {profile.address.line2 && <p>{profile.address.line2}</p>}
                        <p>
                            {profile.address.city && `${profile.address.city}, `}
                            {profile.address.state && `${profile.address.state} `}
                            {profile.address.postal_code}
                        </p>
                        {profile.address.country && <p>{profile.address.country}</p>}
                    </div>
                ) : (
                    <p className="no-data">No address provided</p>
                )}
            </div>

            <div className="profile-section">
                <h4>Account Information</h4>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Employee Since:</span>
                        <span className="value">
                            {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="label">Last Updated:</span>
                        <span className="value">
                            {new Date(profile.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}