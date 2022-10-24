// import APIUrl from "./APIUrl";
import logo from "./images/shop-faster-logo-arrow-black.svg";    //"./images/shopfaster-logo.svg";
// import { useState, useEffect } from "react";
import Nav from "./Nav";
const Header = ({ currentStore, loggedIn, user }) => {
    return (
        <header>
            {/* <h1>Header component</h1>{" "} */}

            <div className="top-display">
                <img className="logo-img" src={logo} alt="Shop Faster Logo" />
                <div className="info-right">
                    <div id="logged-in-status">
                    {user ? user.username : "unknown user"} <div
                            className={`light ${loggedIn
                                ? 'on'
                                : ''}`}
                            
                        ></div>
                    </div>
                    <p className="store-name">
                        {" "}
                        {currentStore ? currentStore.name : "unknown store"}
                    </p>
                </div>
            </div>
            {loggedIn && <Nav />}
        </header>
    );
};
export default Header;
