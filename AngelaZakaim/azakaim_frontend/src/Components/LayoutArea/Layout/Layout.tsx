import { BrowserRouter } from "react-router-dom";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { NavBar } from "../NavBar/NavBar";
import "./Layout.css";
import { Routing } from "../Routing/Routing";

export function Layout() {
    return (
        <div className="Layout">
            {/* This component manages the navigation and rendering of new components */}
            <BrowserRouter>
                {/* <marquee>SOME TEXT HERE</marquee> */}
                <Header/>
                <NavBar/>
                {/* <Home/> */}
                <Routing />
                <Footer/>
            </BrowserRouter>
        </div>
    );
}
