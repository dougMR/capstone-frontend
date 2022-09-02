import { useState, useEffect } from "react";
import APIUrl from "./APIUrl";
import ListItem from "./ListItem";
// import APIUrl from './APIUrl';
console.log("hello from StoreSelector component");
const StoreSelector = ({currentStore, setCurrentStore}) => {
    const [stores, setStores] = useState([]);
    useEffect(() => {
        console.log("useEffect()");
        const getStores = async () => {
            const response = await fetch(`${APIUrl}/stores`,{
                credentials:"include"
            });
            const data = await response.json();
            setStores(data.stores);
      
            const response2 = await fetch(`${APIUrl}/store-current`,{
                credentials:"include"
            });
            const data2 = await response2.json();
            setCurrentStore(data2.currentStore);
        }
        getStores();
    }, []);
    const selectStore = async (store) => {
        // handle selecting currentStore
        if (store === currentStore) {
            window.alert(`${currentStore.name} is already the current store`);
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to select ${store.name}?`
        );
        if (confirmed) {
            // set current store in DB
            await fetch(`${APIUrl}/store-current/${store.id}`,{
                headers: {
                    "Content-Type": "application/json",
                },
                credentials:"include",
                method:"PUT"
            })
            setCurrentStore(store);
            // navigate("/list");
        }
    };
    if (stores.length === 0) {
        return <h1>Loading...</h1>;
    }
    
    return (
        //  Select Store View - Select a Store
        
        <div id="store-select-view" className="view">
            <h2 className="view-title">Select Store</h2>
            <div id="store-list">
                {stores.map((store) => {
                    return (
                        <ListItem
                            key={store.id}
                            item={{
                                name: `${store.name} ${
                                    !currentStore ? '' : store.id === currentStore.id ? "✓" : ''
                                }`,
                                notListItem: true,
                                onclick: (evt) => {
                                    selectStore(store);
                                },
                                active: true,
                            }}
                        />
                    );
                })}
            </div>
            {/* <button id="confirm-store-selection">Confirm Change</button> */}
        </div>
    );
};

export default StoreSelector;
