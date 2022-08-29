import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import APIUrl from "./APIUrl";
const Login = () => {
    console.log("Hello from Login Component");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const isNewUser = searchParams.get("newUser");
    const navigate = useNavigate();
    const login = async (evt) => {
        evt.preventDefault();
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

                setTimeout(() => {
                    navigate("/");
                }, 3000);
            }
            console.log("login data: ", data);
        } catch (error) {
            setError(`Login API call failed. ERROR: ${error}`);
            console.error(error);
        }
    };
    return (
        <div>
            <h1>Login</h1>
            {isNewUser && <p>Your account has been created. Please log in.</p>}
            <form onSubmit={login}>
                <div className="">
                    <label htmlFor="username" className="">
                        Username
                    </label>
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
                    Login
                </button>
                <Link
                    to="/create-account"
                    className="button"
                    style={{ marginLeft: "1em" }}
                >
                    Create New Account
                </Link>
            </form>
        </div>
    );
};

export default Login;
