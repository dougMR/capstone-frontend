import APIUrl from "./APIUrl";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListItem from "./ListItem";
const List = () => {
    console.log(" - Hello from List Component");
    const [hideInactiveItems, setHideInactiveItems] = useState(false);
    const [shoppingList, setShoppingList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getListItems = async () => {
            const response = await fetch(`${APIUrl}/list-items`, {
                credentials: "include",
            });
            const data = await response.json();
            setShoppingList(data.listItems);
            console.log("List > data: ", data);
        };
        getListItems();
    }, []);
    //
    // Make all list items active
    //
    const activateAllItems = async (evt) => {
        const response = await fetch(`${APIUrl}/list-items/active/${true}`, {
            method: "PATCH",
            // don't need headers necessarily?
            credentials: "include",
        });
        const data = await response.json();
        setShoppingList(data.listItems);
    };
    //
    // Make all list items inactive
    //
    const deactivateAllItems = async (evt) => {
        const response = await fetch(`${APIUrl}/list-items/active/${false}`, {
            method: "PATCH",
            credentials: "include",
        });
        const data = await response.json();
        setShoppingList(data.listItems);
    };
    const toggleInactive = (evt) => {
        // Show / Hide inactive items
        setHideInactiveItems(!hideInactiveItems);
    };
    //
    // Deactivate Crossed-Off Items
    //
    const deactivateCrossedOffItems = async (evt) => {
        console.log(`/list-items/crossed-off-inactive...`);
        const response = await fetch(
            `${APIUrl}/list-items/crossed-off-inactive`,
            {
                method: "PATCH",
                credentials: "include",
            }
        );
        const data = await response.json();
        setShoppingList(data.listItems);
    };
    //
    // Make all list items not crossed-off
    //
    const unCrossOffAllItems = async (evt) => {
        console.log("un-cross-off all items");
        const response = await fetch(
            `${APIUrl}/list-items/crossed-off/${false}`,
            {
                method: "PATCH",
                credentials: "include",
            }
        );
        const data = await response.json();
        setShoppingList(data.listItems);
    };
    if(!shoppingList){
        return <h2 className="view-title">Loading...</h2>
    }
    return (
        <div>
            {/* <h1>LIST component</h1> */}
            {shoppingList.length===0 && <p className="directions">Add items to your list with the "+" button below.</p>}
            <div id="list-holder">
                <div id="list">
                    {shoppingList.map((item) => {
                        if (item.active || !hideInactiveItems) {
                            return (
                                <ListItem
                                    key={item.listItemID}
                                    item={item}
                                    setShoppingList={setShoppingList}
                                />
                            );
                        }
                        return null;
                    })}
                </div>
                <div
                    id="add-item"
                    onPointerDown={(evt) => {
                        navigate("/search");
                    }}
                >
                    +
                </div>
                <div id="activation-buttons">
                    <button
                        id="activate-all-button"
                        onPointerDown={activateAllItems}
                    >
                        ACTIVATE ALL
                    </button>
                    <button
                        id="deactivate-all-button"
                        onPointerDown={deactivateAllItems}
                    >
                        DEACTIVATE ALL
                    </button>
                    <button
                        id="toggle-inactive-button"
                        onPointerDown={toggleInactive}
                    >
                        {hideInactiveItems
                            ? "SHOW INACTIVE ELEMENTS"
                            : "HIDE INACTIVE ELEMENTS"}
                    </button>
                    <button
                        id="deactivate-crossed-off-button"
                        onPointerDown={deactivateCrossedOffItems}
                    >
                        DEACTIVATE CROSSED-OFF
                    </button>
                    <button
                        id="un-cross-off-all-button"
                        onPointerDown={unCrossOffAllItems}
                    >
                        UN-CROSS-OFF ALL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default List;
