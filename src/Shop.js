import Map from "./Map";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import APIUrl from "./APIUrl";

const Shop = ({ currentStore }) => {
    const [paths, setPaths] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    console.log(" - Hello from Shop Component");

    useEffect(() => {
        const getShoppingList = async () => {
            const response = await fetch(`${APIUrl}/list-items`, {
                credentials: "include",
            });
            const data = await response.json();
            setShoppingList(data.listItems);
        };
        getShoppingList();
    }, []);
    const updateShoppingList = async (list) => {
        // update list in DB
        const inventoryIDs = [];
        for (const item of list) {
            inventoryIDs.push(list.inventoryID);
        }
        try {
            const response = await fetch(`${APIUrl}/list-items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inventoryIDs,
                }),
                credentials: "include",
            });
            const data = await response.json();
            // update list locally
            console.log("data.listItems: ", data.listItems);
            setShoppingList(data.listItems);
        } catch (e) {
            console.error(e);
        }
    };

    const checkOffCurrentItem = async () => {
        // console.log("Shop > checkOffCurrentItem()");
        const item = shoppingList[0];
        const response = await fetch(
            `${APIUrl}/list-item/crossed-off/${item.listItemID}/${true}`,
            {
                method: "PATCH",
                credentials: "include",
            }
        );
        const data = await response.json();
        setShoppingList(data.listItems);
        // remove first path from paths
        const newPaths = [...paths];
        newPaths.shift();
        if (newPaths.length === 1) {
            setPaths([]);
        } else {
            setPaths(newPaths);
        }
    };

    const getItemsProcured = () => {
        // console.log("Shop > getItemsProcured() shoppingList:", shoppingList);
        return shoppingList.filter((item) => item.active && item.crossedOff)
            .length;
    };

    const getItemsRemaining = () => {
        const activeItems = shoppingList.filter((item) => item.active);
        const crossedOff = activeItems.filter((item) => item.crossedOff);
        // console.log("active: ", activeItems.length);
        // console.log("crossedOff: ", crossedOff.length);
        return activeItems.length - crossedOff.length;
    };

    if (!currentStore || shoppingList.length === 0) {
        return <h1>Loading...</h1>;
    }

    return (
        // Main (Shopping/Map) View
        <div
            id="shopping-view"
            className={`view no-select`}
        >
            {/* SHOP component */}
            <div id="items-status" className="app-row">
                {/* procured / remaining */}
                <div id="items-procured">{getItemsProcured()}✓</div>
                <div
                    id="check-off-current-item-button"
                    className="button"
                    onPointerDown={checkOffCurrentItem}
                >
                    ✓
                </div>
                <div id="items-remaining">...{getItemsRemaining()}</div>
            </div>
            <div id="current-item-div" className="app-row item-name">
                {/* current item  */}
                {/* swipe left or right to see next / prev list item  */}
                {shoppingList.filter((item) => item.active && !item.crossedOff)
                    .length === 0
                    ? "all items procured"
                    : shoppingList[0].name}
            </div>
            <div className="app-row">
                {/* Map  */}
                {/* touch on item dots to bring up that item as Current Item (?)  */}
                <div id="map-window">
                    <Map
                        currentStore={currentStore}
                        shoppingList={shoppingList}
                        updateShoppingList={updateShoppingList}
                        paths={paths}
                        setPaths={setPaths}
                    />
                </div>
            </div>
            {/* <div id="controls" className="app-row"> */}
                {/* Map / List link  */}
                {/* <Link id="open-list-button" to="/list"> */}
                    {/* LIST */}
                {/* </Link> */}
            {/* </div> */}
        </div>
    );
};

export default Shop;
