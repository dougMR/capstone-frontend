import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Shop from "./Shop";
import Login from "./Login";
import List from "./List";
import Launch from "./Launch";
import Search from "./Search";
import Layout from "./Layout";
import StoreSelector from "./StoreSelector";
import APIUrl from "./APIUrl";
console.log("Hello from App.js");

function App() {
    const [currentStore, setCurrentStore] = useState(null);
    const [loggedIn, setLoggedIn] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        
    }, []);

    useEffect(() => {
        const checkLoggedIn = async () => {
            console.log("App > checkLoggedIn()");
            // see if we're logged in
            // request loginStatus
            const responseLS = await fetch(`${APIUrl}/loginStatus`, {
                credentials: "include",
            });
            const dataLS = await responseLS.json();
            // console.log("App > dataLS: ", dataLS);
            if (dataLS.isLoggedIn) {
                setUser(dataLS.user);
            } else {
                setUser(null);
            }
            setLoggedIn(dataLS.isLoggedIn);
        };
        const getCurrentStore = async () => {
            const response2 = await fetch(`${APIUrl}/store-current`, {
                credentials: "include",
            });
            const data2 = await response2.json();
            setCurrentStore(data2.currentStore);
        };
        checkLoggedIn();
        if(loggedIn){
            getCurrentStore();
        }
    }, []);

    console.log(" - Hello from App Component");
    // why does App component keep reloading?
    return (
        <div id="app-body">
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Layout currentStore={currentStore} loggedIn={loggedIn}
                        user={user} />}
                    >
                        <Route path="/" element={<Launch />} />
                        <Route
                            path="/shop"
                            element={<Shop currentStore={currentStore} />}
                        />
                        <Route
                            path="/search"
                            element={<Search currentStore={currentStore} />}
                        />
                        <Route path="/list" element={<List />} />
                        <Route
                            path="/stores"
                            element={
                                <StoreSelector
                                    currentStore={currentStore}
                                    setCurrentStore={setCurrentStore}
                                />
                            }
                        />
                        <Route path="/login" element={<Login setUser={setUser} setLoggedIn={setLoggedIn} setCurrentStore={setCurrentStore} />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
