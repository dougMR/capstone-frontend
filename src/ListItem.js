import APIUrl from "./APIUrl";
import { useState } from "react";
const ListItem = ({ item, setShoppingList }) => {
    // console.log('listItem: ',item);
    const [open, setOpen] = useState(false);

    // Remove Item from List
    const removeItemFromList = async (evt) => {
        const willDelete = window.confirm(
            "Are you sure you want to delete this item"
        );
        if (!willDelete) return;

        const response = await fetch(`${APIUrl}/list-item/${item.listItemID}`, {
            method: "DELETE",
            credentials: "include",
        });
        const data = await response.json();
        setShoppingList(data.listItems);
    };

    const toggleItemActive = async (evt) => {
        item.active = !item.active;
        const response = await fetch(
            `${APIUrl}/list-item/active/${item.listItemID}/${item.active}`,
            {
                method: "PATCH",
                // don't need headers if there's no body?
                credentials: "include",
            }
        );

        const data = await response.json();

        setShoppingList(data.listItems);
        closeItemControls();
    };

    const toggleItemCrossedOff = async (item) => {
        item.crossedOff = !item.crossedOff;
        const response = await fetch(
            `${APIUrl}/list-item/crossed-off/${item.listItemID}/${item.crossedOff}`,
            {
                method: "PATCH",
                credentials: "include",
            }
        );
        const data = await response.json();
        setShoppingList(data.listItems);
        closeItemControls();
    };

    // // Open Item controls
    const openItemControls = (evt) => {
        setOpen(true);
    };

    // Close Item controls
    const closeItemControls = (evt) => {
        setOpen(false);
    };

    // Toggle Item controls
    const toggleItemControls = (evt) => {
        setOpen(!open);
    }

    return (
        <div
            className={`list-item no-select ${item.active ? " active" : ""}${
                item.crossedOff ? " crossed-off" : ""
            }${open ? " open" : ""}`}
            onPointerDown={item.onclick ? item.onclick : toggleItemControls}
        >
            <div className="item-name">
                {item.name}
                {/* <br />
                <span style={{ fontSize: "0.5em" }}>
                    id: [{item.listItemID}], storeID: [{item.storeID}],
                    item.active: [{item.active ? "true" : "false"}],
                    item.crossedOff: [{item.crossedOff ? "true" : "false"}],
                    order: [{item.sortOrder}]
                </span> */}
            </div>
            {item.notListItem ? (
                // Don't include controls
                ""
            ) : (
                <div className={`item-controls`}>
                    <button
                        className="item-button remove-button"
                        onPointerDown={removeItemFromList}
                    ></button>
                    <button
                        className="item-button disable-button"
                        onPointerDown={toggleItemActive}
                    ></button>
                    <button
                    style={{display: item.active ? "inline-block" : "none"}}
                        className="item-button cross-off-button"
                        onPointerDown={(evt) => {
                            toggleItemCrossedOff(item);
                        }}
                    ></button>
                </div>
            )}
        </div>
    );
};

export default ListItem;
