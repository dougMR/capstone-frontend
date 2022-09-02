import APIUrl from "./APIUrl";
import { useState } from "react";
import ListItem from "./ListItem";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Search = ({currentStore}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [shoppingList,setShoppingList] = useState(null);
    const [message,setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getShoppingList = async () => {
            const response = await fetch(`${APIUrl}/list-items`,{
                credentials:"include"
            });
            const data = await response.json();
            setShoppingList(data.listItems);
            console.log("data.listItems: ",data.listItems);
        }
        getShoppingList();
    }, []);

    useEffect(()=>{
        const getInventory = async () => {
            const response = await fetch(`${APIUrl}/store/inventory/${currentStore.id}`);
            const data = await response.json();
            const inventory = data.inventory;
            const items = [];
            for(const inv of inventory){
                // get Item
                const response = await fetch(`${APIUrl}/item/${inv.item_id}`);
                const data = await response.json();
                items.push(data.item);
            }
        };
        if(currentStore)getInventory();
    },[currentStore]);
    
    const updateShoppingList = async (list) => {
        const inventoryIDs = [];
        for(const item of list){
            inventoryIDs.push(list.inventoryID);
        }
        const response = await fetch(`${APIUrl}/list-items`,{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                inventoryIDs
            }),
            credentials:"include"
        });
        const data = response.json();
        setShoppingList(data.listItems);
    }

    const searchForItem = async (evt) => {
        evt.preventDefault();
        console.log("search for ",searchTerm);
        const results = await fetch(
            `${APIUrl}/inventory/search/${searchTerm}`,
            {
                credentials: "include",
            }
        );
        const data = await results.json();
        setSearchResults(data.items);
        console.log('searchResults: ',searchResults);
        if(searchResults.length===0){
            setMessage("No Matching Items Found.");
        }else{
            setMessage("");
        }
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
        return itemIndex !== -1;
    }

    if(!currentStore || !shoppingList){
        console.log("currentStore: ",currentStore);
        // console.log("inventory: ",inventory.length);
        console.log("shoppingList: ",shoppingList);
        return(
            <h1>Select a Store...</h1>
        )
    }

    return (
        <div id="search-view">
            {/* <h1>Search - {currentStore.name}</h1> */}
            <h2 className="view-title">Search {currentStore.name}</h2>
            <form onSubmit={searchForItem}>
                <label>Item Name</label>
                <br />
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
            { 
            searchResults.length === 0 ?
                <p className="directions" style={{fontSize: "2rem", marginTop: 0}}>{message}</p>
            :
                searchResults.map((item) => {
                const onList = checkAlreadyOnList(item);
                if(onList){
                    item.name += " (ON LIST)";
                }
                item.notListItem = true;
                item.active = true;
                if(!onList)item.onclick = (evt) => selectItem(item);
                return <ListItem key={item.inventoryID} item={item} />;
            })
            }
        </div>
    );
};

export default Search;
