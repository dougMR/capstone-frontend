import Map from "./Map";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import APIUrl from "./APIUrl";

const Shop = ({ shoppingList, updateShoppingList, currentStore }) => {
    const [paths, setPaths] = useState([]);
    console.log(" - Hello from Shop Component");
    const checkOffCurrentItem = async () => {
        console.log("Shop > checkOffCurrentItem()");
        const item = shoppingList[0];
        const response = await fetch(
            `${APIUrl}/list-item/crossed-off/${item.listItemID}/${true}`,
            {
                method: "PATCH",
                // don't need headers?
                credentials: "include",
            }
        );
        // remove first path from paths
        const newPaths = [...paths];
        newPaths.shift();
        setPaths(newPaths);
        
        const data = await response.json();
        console.log("crossedOff? : ", data.listItems[0].crossedOff);
        updateShoppingList(data.listItems);
    };
    const getItemsProcured = () => {
        console.log("Shop > getItemsProcured() shoppingList:",shoppingList);
        return shoppingList.filter((item) => item.active && item.crossedOff)
            .length;
    };
    const getItemsRemaining = () => {
        const activeItems = shoppingList.filter((item) => item.active);
        const crossedOff = activeItems.filter((item) => item.crossedOff);
        console.log("active: ", activeItems.length);
        console.log("crossedOff: ", crossedOff.length);
        return activeItems.length - crossedOff.length;
    };


    return (
        // Main (Shopping/Map) View
        <div
            id="shopping-view"
            className={`view no-select ${shoppingList ? "test" : "test"}`}
        >
            SHOP component
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
                    <Map currentStore={currentStore} shoppingList={shoppingList} updateShoppingList={updateShoppingList} paths={paths} setPaths={setPaths}/>
                </div>         
            </div>
            <div id="controls" className="app-row">
                {/* Map / List link  */}
                <Link id="open-list-button" to="/list">
                    LIST
                </Link>
            </div>
        </div>
    );
};

export default Shop;
