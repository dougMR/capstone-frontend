import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import ListItem from "./ListItem";
import APIUrl from "./APIUrl";
console.log("Hello from ViewInventory.js");

const ViewInventory = ({ currentStore }) => {
    console.log(" - Hello from ViewInventory Component");
    const [inventoryItems, setInventoryItems] = useState([]);
    // console.log("currentStore: ",currentStore);
    // const navigate = useNavigate();

    // useEffect(() => {
    //     const checkLoggedIn = async () => {
    //         // see if we're logged in
    //         // request loginStatus
    //         const responseLS = await fetch(`${APIUrl}/loginStatus`, {
    //             credentials: "include",
    //         });
    //         const dataLS = await responseLS.json();
    //         console.log("Launch > dataLS: ", dataLS);
    //         if (dataLS.isLoggedIn) {
    //             navigate("/stores");
    //         } else {
    //             navigate("/login");
    //         }
    //     };
    //     checkLoggedIn();
    // }, [navigate]);

    useEffect(() => {
        console.log("--currentStore: ", currentStore);
        // Get complete inventory for store
        const getInventoryFromDB = async (storeID) => {
            const response = await fetch(
                `${APIUrl}/store/inventory/${storeID}`
            );
            const data = await response.json();
            const inventory = data.inventory;
            const tempInvItems = [];
            for (const item of inventory) {
                const response2 = await fetch(
                    `${APIUrl}/item/${item.item_id}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const data2 = await response2.json();
                tempInvItems.push(data2.item);
            }
            tempInvItems.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            setInventoryItems([...tempInvItems]);
            console.log("tempInvItems: ", tempInvItems);
        };
        if (currentStore) getInventoryFromDB(currentStore.id);
    }, [currentStore]);
    if (inventoryItems.length === 0) {
        return <h1>Retrieveing Inventory...</h1>;
    }
    console.log("inventoryItems: ", inventoryItems);
    return (
        <>
            <h1>View Inventory</h1>
            <div id="list">
                {inventoryItems.map((item) => {
                    return (
                        <div key={item.id}>
                            <ListItem item={item} />
                            {
                                <p>
                                    {item.tags.map((tag, index) => {
                                        return (
                                            <span style={{color: 'white'}} key={index}>
                                                {tag.name},{" "}
                                            </span>
                                        );
                                    })}
                                </p>
                            }
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default ViewInventory;
