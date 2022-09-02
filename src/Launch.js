import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import APIUrl from "./APIUrl";
console.log("Hello from Launch.js");
const Launch = () => {
    console.log(" - Hello from Launch Component");
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoggedIn = async () => {
            // see if we're logged in
            // request loginStatus
            const responseLS = await fetch(`${APIUrl}/loginStatus`, {
                credentials: "include",
            });
            const dataLS = await responseLS.json();
            console.log("Launch > dataLS: ", dataLS);
            if (dataLS.isLoggedIn) {
                navigate("/list");
            } else {
                navigate("/login");
            }
        };
        checkLoggedIn();
    }, [navigate]);

    return (
        <>
            <h1>Loading...</h1>
        </>
    );
};

export default Launch;
