import "./Header.css";
import { AuthMenu } from "../../AuthArea/AuthMenu/AuthMenu";

export function Header() {
    return (
        <header className="Header">
            <div></div>
            <h1>GO-2 Market</h1>
            <AuthMenu/>
        </header>
    );
}
