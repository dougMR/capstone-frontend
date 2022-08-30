import "./App.css";

import APIUrl from "./APIUrl";
console.log("Hello from App.js");
function App() {



        const checkAppStatus = async () => {
            // Log In
            const response = await fetch(`${APIUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "Doug R",
                    password: "secretpassword",
                }),
                credentials: "include",
            });
            const data = await response.json();
            console.log("App > data: ", data);
            console.log('data.sessionUser: ',data.sessionUser);
            console.log('data.sessionCookie: ',data.sessionCookie);
            // Get Shopping List
            const responseSL = await fetch(`${APIUrl}/list-items`,{
                credentials: "include"
            });
            const dataSL = await responseSL.json();
            console.log("dataSL: ",dataSL);

            const checkLoginStatus = async () => {
                
                console.log("App > checkAppStatus()");

                const response1 = await fetch(`${APIUrl}/loginStatus`, {
                    credentials: "include",
                });
                const data1 = await response1.json();
                console.log("App > data1: ", data1);
            };
            setTimeout(() => {
                checkLoginStatus();
            }, 2000);
        };
        checkAppStatus();

    return (
        <div id="app-body">
           <h1>App.js</h1>
        </div>
    );
}

export default App;
