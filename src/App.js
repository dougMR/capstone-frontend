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
import CreateAccount from "./CreateAccount";
import APIUrl from "./APIUrl";
console.log("Hello from App.js");
function App() {
    console.log(" - Hello from App Component");
    // why does App component keep reloading?
    const [storeID, setStoreID] = useState(-1);
    const [currentStore, setCurrentStore] = useState(null);
    const [stores, setStores] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);

    const updateShoppingList = (newList) => {
        // console.log("list BEFORE sorting: ",newList);
        // newList.sort(sortListByStatus);
        // console.log("list AFTER sorting: ",newList);
        setShoppingList(newList);
        console.log("SET SHOPPING LIST: ", newList);
    };

    useEffect(() => {
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
        // checkAppStatus();
    }, []);

    useEffect(() => {
        console.log("App > currentStore has been set.");
        console.log("App > currentStore: ", currentStore);
        // Go to Shopping List view
        // Don't change Old List in db
        //
        // Look through List_items table
        //  • find all for user_id / inventory_id > new store_id
        //  • add those to new list
        // For every item on old list...
        //  • search it by name in new list
        //      - if exact match, remove old item from new list
        //  • search it by name in new store's inventory
        //  • if exact match, add matching item to new list
        //  • if inexact match, show replacement options at new store
        //      - user selects an option or 'none'
        //      - add that item to new list
        //
        // Replace setShoppingList( newList )

        // Same function recreated here, to prevent useEffect() dependency?
        const updateShoppingListDuplicate = (newList) => {
            console.log("UPDATESHOPPINGLISTDUPLICATE() !!!");
            // newList.sort(sortListByStatus);
            setShoppingList(newList);
            console.log("App > SHOPPING LIST: ", newList);
        };

        const changeCurrentStoreInDB = async () => {
            console.log("App > changeCurrentStoreInDB()");
            await fetch(`${APIUrl}/store/${currentStore.id}`, {
                method: "PUT",
                credentials: "include",
            });
        };

        const loadNewList = async () => {
            console.log("App > loadNewList()");
            // For now, just grab shoppihng list for this store / user
            // Get Shopping List
            // with item: {listItemID: item.id, inventoryID: inventory_item.id, itemID: item.id, name: item.name, tile: inventory_item.tile}
            const response4 = await fetch(`${APIUrl}/list-items`, {
                credentials: "include",
            });
            const data4 = await response4.json();
            updateShoppingListDuplicate(data4.listItems);
        };
        if (currentStore) {
            changeCurrentStoreInDB();
            // setTimeout(loadNewList,1000);
            loadNewList();
        }
    }, [currentStore]);

    return (
        <div id="app-body">
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Layout currentStore={currentStore} />}
                    >
                        <Route
                            path="/"
                            element={
                                <Launch
                                    storeID={storeID}
                                    currentStore={currentStore}
                                    stores={stores}
                                    shoppingList={shoppingList}
                                    setStoreID={setStoreID}
                                    setCurrentStore={setCurrentStore}
                                    setStores={setStores}
                                    updateShoppingList={updateShoppingList}
                                />
                            }
                        />
                        <Route
                            path="/shop"
                            element={
                                <Shop
                                    shoppingList={shoppingList}
                                    updateShoppingList={updateShoppingList}
                                    currentStore={currentStore}
                                />
                            }
                        />
                        <Route
                            path="/search"
                            element={
                                <Search
                                    updateShoppingList={updateShoppingList}
                                    currentStore={currentStore}
                                    shoppingList={shoppingList}
                                />
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/list"
                            element={
                                <List
                                    shoppingList={shoppingList}
                                    updateShoppingList={updateShoppingList}
                                />
                            }
                        />
                        <Route
                            path="/stores"
                            element={
                                <StoreSelector
                                    stores={stores}
                                    currentStore={currentStore}
                                    setCurrentStore={setCurrentStore}
                                />
                            }
                        />
                        <Route
                            path="/create-account"
                            element={<CreateAccount />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
