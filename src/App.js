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
    console.log(" - Hello from App Component");
    // why does App component keep reloading?
    const [storeID, setStoreID] = useState(-1);
    const [currentStore, setCurrentStore] = useState(null);
    const [stores, setStores] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);

    const updateShoppingList = (newList) => {
        newList.sort(sortListByStatus);
        setShoppingList(newList);
        console.log('SHOPPING LIST: ',newList);
    };
    // const updateShoppingList = useCallback((newList) => {
    //     newList.sort(sortListByStatus);
    //     setShoppingList(newList);
    //     // console.log("SHOPPING LIST: ", newList);
    // }, [setShoppingList]);

    useEffect(() => {
        console.log("currentStore has been set.");
        console.log("currentStore: ", currentStore);
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

        const updateShoppingListDuplicate = (newList) => {
            newList.sort(sortListByStatus);
            setShoppingList(newList);
            console.log('SHOPPING LIST: ',newList);
        };

        const changeCurrentStoreInDB = async () => {
            await fetch(`${APIUrl}/store/${currentStore.id}`, {
                method: "PUT",
                credentials: "include",
            });
        };

        const loadNewList = async () => {
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

    // Sort List by active / crossed out / inactive
    const sortListByStatus = (a, b) => {
        // if a is active and b is active
        if (a.active && b.active) {
            // both active
            if (a.crossedOff && !b.crossedOff) {
                return 1;
            } else if (!a.crossedOff && b.crossedOff) {
                return -1;
            } else {
                // both crossed off or both not crossed off
                return 0;
            }
        } else {
            if (a.active) {
                return -1;
            } else if (b.active) {
                return 1;
            } else {
                // both not active
                if (a.crossedOff && !b.crossedOff) {
                    return 1;
                } else if (!a.crossedOff && b.crossedOff) {
                    return -1;
                } else {
                    // both crossed off or both not crossed off
                    return 0;
                }
            }
        }
    };

    const sortListByShoppingOrder = (a, b) => {};

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
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
