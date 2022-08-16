import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListItem from "./ListItem";
// import APIUrl from './APIUrl';

const StoreSelector = ({ stores, currentStore, setCurrentStore }) => {
    const navigate = useNavigate();
    const selectStore = (store) => {
        // handle selecting currentStore
        if(store === currentStore){
            window.alert(`${currentStore.name} is already the current store`);
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to select ${store.name}?`
        );
        if (confirmed) {
            setCurrentStore(store);
            navigate('/list');
        }
    };
    return (
        //  Select Store View - Select a Store
        <div id="store-select-view" className="view">
            SELECT STORE
            <div id="store-list">
                {stores.map((store) => {
                    return (
                        <ListItem
                            key={store.id}
                            item={{
                                name: `${store.name} ${store.id === currentStore.id ? '✓' : ''}`,
                                notListItem: true,
                                onclick: (evt)=>{selectStore(store)},
                                active: true
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
