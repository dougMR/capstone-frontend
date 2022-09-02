import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import APIUrl from "./APIUrl";
const Login = ({ setUser, setLoggedIn, setCurrentStore }) => {
    console.log("Hello from Login Component");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const creatingAccount = searchParams.get("creatingAccount");
    const newUser = searchParams.get("newUser");
    const logOut = searchParams.get("logout");
    const navigate = useNavigate();

    useEffect(()=>{
        if(!newUser){
            setUsername("");
            setPassword("");
        }
    },[]);

    const createAccount = async () => {
        try {
            await logout();
            const response = await fetch(`${APIUrl}/create-account`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
                credentials: "include",
            });
            const data = await response.json();
            if (data.error) {
                setError(data.error);
            } else {
                setError("");
                // Successfully created account
                navigate("/login?newUser=true");
            }
            console.log(data);
        } catch (error) {
            setError(`/create-account API call failed. ERROR: ${error}`);
            console.error(error);
        }
    };

    const logout = async () => {
        const response = await fetch(`${APIUrl}/logout`, {
            credentials: "include",
        });
        const data = await response.json();
        setLoggedIn(data.isLoggedIn);
        setUser(null);
        setCurrentStore(null);
    };
    if (logOut === "true") {
        logout();
    }

    const login = async () => {
        console.log("Login > login()");
        try {
            const response = await fetch(`${APIUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
                credentials: "include",
            });
            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setError("");
                // redirect to Launch, login successful
                setLoggedIn(data.isLoggedIn);
                setUser(data.sessionUser);
                if (data.isLoggedIn) {
                    const response2 = await fetch(`${APIUrl}/store-current`, {
                        credentials: "include",
                    });
                    const data2 = await response2.json();
                    if(data2.error){
                        setError(data2.error);
                    }
                    if(data2.currentStore){
                        setCurrentStore(data2.currentStore);
                        navigate("/list");
                    }else{
                        navigate("/stores")
                    }
                }
            }
        } catch (error) {
            setError(`Login API call failed. ERROR: ${error}`);
            console.error(error);
        }
    };

    const submitForm = async (evt) => {
        evt.preventDefault();
        if (creatingAccount) {
            await createAccount();
        } else {
            await login();
        }
    };
    return (
        <div className="view">
            {/* <h1>Login</h1> */}
            {creatingAccount && (
                <p className="directions">
                    Enter a username and password to create an account.
                </p>
            )}
            {newUser && (
                <p className="directions">
                    Your account has been created. Log in.
                </p>
            )}
            {!newUser && !creatingAccount && (
                <p className="directions">
                    Enter username and password to log in.
                </p>
            )}
            <form id="login-form" onSubmit={submitForm}>
                <div className="">
                    <label htmlFor="username" className="">
                        Username
                    </label>
                    <br />
                    <input
                        type="text"
                        className=""
                        id="username"
                        value={username}
                        onChange={(evt) => {
                            setUsername(evt.target.value);
                        }}
                    />
                </div>
                <div className="">
                    <label
                        htmlFor="exampleInputPassword1"
                        className="form-label"
                    >
                        Password
                    </label>
                    <br />
                    <input
                        type="password"
                        className=""
                        id="exampleInputPassword1"
                        value={password}
                        onChange={(evt) => {
                            setPassword(evt.target.value);
                        }}
                    />
                </div>
                <p style={{ color: "red" }}>{error}</p>
                <button type="submit" className="">
                    {creatingAccount ? "Submit" : "Login"}
                </button>
                {!creatingAccount && !newUser && (
                    <Link
                        to="/login?creatingAccount=true"
                        className="button-basic"
                        style={{ marginLeft: "1em" }}
                    >
                        Create New Account
                    </Link>
                )}
            </form>
        </div>
    );
};

export default Login;
