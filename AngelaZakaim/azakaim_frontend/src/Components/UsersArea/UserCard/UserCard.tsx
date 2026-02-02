import { NavLink } from "react-router-dom";
import type { User } from "../../../Models/User";

interface UserProps {
    user: User;
}

export function UserCard({ user }: UserProps) {
    return (
        <div className="UserCard">
            <NavLink to={`/users/${user.id}`}>
                <h3>{user.username}</h3>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                {!user.is_active && <span className="badge inactive">Banned</span>}
            </NavLink>
        </div>
    );
}