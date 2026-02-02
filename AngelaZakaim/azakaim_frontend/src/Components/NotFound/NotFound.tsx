import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export function NotFound() {

    const navigate = useNavigate();

    function goHome(){
        navigate('/home');
    }

    return (
        <div className="NotFound">
            <button onClick={goHome}>Home</button><br/>
            <img src='not_found.png' alt='Not found' />
        </div>
    );
}
