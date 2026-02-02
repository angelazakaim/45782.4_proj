// CustomerProfileDisplay.tsx - Display customer profile information
import type { Customer } from "../../../Models/Customer";
import "./CustomerProfileDisplay.css";

interface CustomerProfileDisplayProps {
    profile: Customer;
}

export function CustomerProfileDisplay({ profile }: CustomerProfileDisplayProps) {
    return (
        <div className="CustomerProfileDisplay">
            <h3>Customer Profile</h3>
            
            <div className="profile-section">
                <h4>Personal Information</h4>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Full Name:</span>
                        <span className="value">{profile.full_name}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Phone:</span>
                        <span className="value">{profile.phone || 'Not provided'}</span>
                    </div>
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
                        <span className="label">Customer Since:</span>
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