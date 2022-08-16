import logo from "./images/shopfaster-logo.svg";
import Nav from "./Nav";
const Header = ({ currentStore }) => {
    return (
        <header>
<h1>
    Header component
    </h1>                <div className="top-display">
                    <img
                        className="logo-img"
                        src={logo}
                        alt="Shop Faster Logo"
                    />
                    <p className="store-name">
                        {" "}
                        {currentStore ? currentStore.name : "unknown"}
                    </p>
                </div>
            <Nav />
        </header>
    );
};
export default Header;
