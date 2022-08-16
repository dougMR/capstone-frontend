import APIUrl from "./APIUrl";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListItem from "./ListItem";
const List = ({ shoppingList, updateShoppingList }) => {
    console.log(" - Hello from List Component");
    const [hideInactiveItems, setHideInactiveItems] = useState(false);
    const navigate = useNavigate();

    const activateAllItems = async (evt) => {
        const response = await fetch(`${APIUrl}/list-items/active/${true}`, {
            method: "PATCH",
            // don't need headers necessarily?
            credentials: "include",
        });
        const data = await response.json();
        updateShoppingList(data.listItems);
    };
    const deactivateAllItems = async (evt) => {
        const response = await fetch(`${APIUrl}/list-items/active/${false}`, {
            method: "PATCH",
            // don't need headers if there's no body?
            credentials: "include",
        });
        const data = await response.json();
        updateShoppingList(data.listItems);
    };
    const toggleInactive = (evt) => {
        // Show / Hide inactive items
        setHideInactiveItems(!hideInactiveItems);
    };
    const unCrossOffAllItems = async (evt) => {
        console.log('un-cross-off all items');
        const response = await fetch(`${APIUrl}/list-items/crossed-off/${false}`, {
            method: "PATCH",
            credentials: "include",
        });
        const data = await response.json();
        updateShoppingList(data.listItems);
    }

    return (
        <div>
            <h1>LIST component</h1>
            <div id="list-holder">
                <div id="list">
                    {shoppingList.map((item) => {
                        if (item.active || !hideInactiveItems) {
                            return (
                                <ListItem
                                    key={item.listItemID}
                                    item={item}
                                    updateShoppingList={updateShoppingList}
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
