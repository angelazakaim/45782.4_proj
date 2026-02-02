import { useState, useEffect } from "react";
import { usersService } from "../../../Services/UsersService";
import type { UserStatistics as UserStatisticsType } from "../../../Models/User";
import "./UserStatistics.css";

export function UserStatistics() {
    const [stats, setStats] = useState<UserStatisticsType | null>(null);
    
    useEffect(() => {
        const loadStats = async () => {
            const data = await usersService.getUserStatistics();
            setStats(data);
        };
        loadStats();
    }, []);
    
    return (
        <div className="UserStatistics">
            <h2>User Statistics</h2>
            <div className="stat-cards">
                <div className="stat-card">
                    <h3>{stats?.total_users}</h3>
                    <p>Total Users</p>
                </div>
                <div className="stat-card">
                    <h3>{stats?.active_users}</h3>
                    <p>Active Users</p>
                </div>
                <div className="stat-card">
                    <h3>{stats?.inactive_users}</h3>
                    <p>Banned Users</p>
                </div>
            </div>
            
            <div className="role-breakdown">
                <h3>By Role</h3>
                <p>Customers: {stats?.by_role.customers}</p>
                <p>Managers: {stats?.by_role.managers}</p>
                <p>Cashiers: {stats?.by_role.cashiers}</p>
                <p>Admins: {stats?.by_role.admins}</p>
            </div>
        </div>
    );
}