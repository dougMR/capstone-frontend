import APIUrl from "./APIUrl";
import { useState } from "react";
import ListItem from "./ListItem";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Search = ({ updateShoppingList, shoppingList, currentStore }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    useEffect(()=>{
        const getInventory = async () => {
            const response = await fetch(`${APIUrl}/store/inventory/${currentStore.id}`);
            const data = await response.json();
            const inventory = data.inventory;
            console.log('data: ',data);
            const items = [];
            for(const inv of inventory){
                // get Item
                const resp = await fetch(`${APIUrl}/item/${inv.item_id}`);
                const dat = await resp.json();
                items.push(dat.item);
            }
            console.log("Store Inventory: ",items);
        };
        getInventory();
    },[]);
    

    const searchForItem = async (evt) => {
        evt.preventDefault();
        const results = await fetch(
            `${APIUrl}/inventory/search/${searchTerm}`,
            {
                credentials: "include",
            }
        );
        const data = await results.json();
        setSearchResults(data.items);
        console.log("searchResults for ", searchTerm, ": ", data.items);
    };

    const selectItem = async (item) => {
        console.log("selecting item: ", item);
        const response = await fetch(`${APIUrl}/list-item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inventoryID: item.inventoryID,
            }),
            credentials: "include",
        });
        console.log("response: ", response);
        const data = await response.json();
        if (data.error) {
            console.error("ERROR: ", data.error);
            window.alert(`${item.name} already in your shopping list`);
        } else {
            updateShoppingList(data.listItems);
            navigate("/list");
        }
    };

    const checkAlreadyOnList = (item) => {
        const itemIndex = shoppingList.findIndex(listItem=>listItem.name===item.name);
        console.log("checkAlreadyOnList: ",item);
        console.log("IS ON LIST: ",itemIndex);
        return itemIndex !== -1;
    }

    return (
        <div>
            <h1>Search - {currentStore.name}</h1>
            <form onSubmit={searchForItem}>
                <label htmlFor="">Item Name</label>
                <input className="search-field"
                    type="text"
                    // className="form-control"
                    value={searchTerm}
                    onChange={(evt) => {
                        setSearchTerm(evt.target.value);
                    }}
                />
                <br />
                <button
                    type="submit"
                    // className="btn btn-primary"
                >
                    Search
                </button>
            </form>
            {searchResults.map((item) => {
                const onList = checkAlreadyOnList(item);
                if(onList){
                    item.name += " (ON LIST)";
                }
                console.log("item: ", item);
                item.notListItem = true;
                item.active = true;
                if(!onList)item.onclick = (evt) => selectItem(item);
                return <ListItem key={item.inventoryID} item={item} />;
            })}
        </div>
    );
};

export default Search;
