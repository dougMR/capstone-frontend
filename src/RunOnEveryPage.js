const RunOnEveryPage = () => {

    useEffect(() => {
        const CheckLoggedInGetStoresAndGetCurrentStore = async () => {
            console.log('RunOnEveryPage > CheckLoggedInGetStoresAndGetCurrentStore()');
            // see if we're logged in
            // request loginStatus
            // have loginStatus return storeID (user's last selected store) if loggedIn
            const response1 = await fetch(`${APIUrl}/loginStatus`, {
                credentials: "include",
            });
            const data1 = await response1.json();
            console.log("RunOnEveryPage > data1: ",data1);
            if (data1.isLoggedIn) {
                // Get stores[].
                // store: {id, name, map_url, entrance_tile_id, checkout_tile_id}
                const response2 = await fetch(`${APIUrl}/stores`, {
                    credentials: "include",
                });
                const data2 = await response2.json();
                console.log('RunOnEveryPage > data2.stores: ',data2.stores);

                // set currentStore to the complete store object
                const response3 = await fetch(
                // {name, id, floorPlanImage, entranceTile, checkoutTile, grid[]}
                    `${APIUrl}/store/${data1.storeID}`,
                    {
                        credentials: "include",
                    }
                );
                const data3 = await response3.json();
                // Get Shopping List
                // with item: {listItemID: item.id, inventoryID: inventory_item.id, itemID: item.id, name: item.name, tile: inventory_item.tile}
                const response4 = await fetch(`${APIUrl}/list-items`, {
                    credentials: "include",
                });
                const data4 = await response4.json();

                setStores(data2.stores);
                updateShoppingList(data4.listItems);
                // setStoreID(data1.storeID);
                setCurrentStore(data3.store);
                console.log("RunOnEveryPage > TILE: ",data3.store.grid[0][0]);
                
            } else {
                navigate("/login");
            }
        };
        // getStores();
        CheckLoggedInGetStoresAndGetCurrentStore();
    }, [navigate]);
    return(
        <div>
            <h1>Run On Every Page</h1>
        </div>
    )
}

export default RunOnEveryPage;