import APIUrl from "./APIUrl";
import PathfindingFn from "./Pathfinding";
import { useEffect, useState, useRef } from "react";

// Non-state variables
let startMapWidth, startMapHeight;
let tileSize = 0;
let mapWidth = 300;
let mapHeight = 300;
let mapLeft = 0;
let mapTop = 0;
let lastZoom = 1;
let dragging = false;
let obstaclesVisible = true;
let gridOn = true;

const Map = ({
    paths,
    setPaths,
    currentStore,
    shoppingList,
    updateShoppingList,
}) => {
    console.log(" - Hello from Map component");
    console.log("currentStore.mapURL: ",currentStore.mapURL);
    const [zoom, setZoom] = useState(0);
    const [imageLoadDone, setImageLoadDone] = useState(false);
    const [startDragPosition, setStartDragPosition] = useState({});
    const [ctx, setCtx] = useState(null);
    // booleanFlag is state var just to force redraw of map canvas and map img
    const [booleanFlag, setBooleanFlag] = useState(false);
    const [showingPaths, setShowingPaths] = useState(true);
    // const [mapLeft, setMapLeft] = useState(0);
    // const [mapTop, setMapTop] = useState(0);
    // const [mapWidth, setMapWidth] = useState(300);
    // const [mapHeight, setMapHeight] = useState(300);
    const [progressPercent, setProgressPercent] = useState(0);

    const Pathfinding = PathfindingFn(setProgressPercent);

    // v Start startTile as entranceTile.
    //   After an item is crossed off, set this to the last crossed-off item, because that's likely where the user is closest to
    // const [startTile, setStartTile] = useState(null);
    // const [boolFlag, setBoolFlag] = useState(true);

    // const startMapWidth = useRef(0);
    // const startMapHeight = useRef(0);
    const zoomSliderRef = useRef(null);
    const mapImgRef = useRef(null);
    const mapHolderRef = useRef(null);
    const mapCanvasRef = useRef(null);
    const mapContextRef = useRef(null);

    // useEffect(()=>{
    //     console.log("progressPercent: ",progressPercent);
    // },[progressPercent]);

    const imageLoaded = () => {
        // Initialize image and canvas
        const mapHolder = mapHolderRef.current;
        console.log("imageLoaded()");
        //
        // v Should I do this JS DOM stuff with state?  Even though it gets set only once?

        // make it square
        mapHolder.style.height = `${mapHolder.offsetWidth}px`;
        const mapImg = mapImgRef.current;
        // is map taller than wide?
        if (mapImg.offsetHeight > mapImg.offsetWidth) {
            // css starts mapImg width at 100% of mapHolder width,
            // so adjust the width and the height will adapt
            const resizeRatio = mapHolder.offsetHeight / mapImg.offsetHeight;
            mapImg.style.width = `${resizeRatio * 100}%`;
        }

        startMapWidth = mapImg.offsetWidth;
        startMapHeight = mapImg.offsetHeight;
        console.log("startMapWidth: ", startMapWidth);
        console.log("startMapHeight: ", startMapHeight);

        // console.log("startMapWidth, height: ", mapImg.width, mapImg.height);
        // startMapWidth.current = mapImg.offsetWidth;
        // startMapHeight.current = mapImg.offsetHeight;
        // setMapWidth(startMapWidth);
        mapWidth = startMapWidth;
        // setMapHeight(startMapHeight);
        mapHeight = startMapHeight;
        // console.log("startMapWidth, height: ", mapImg.width, mapImg.height);
        setImageLoadDone(true);

        //Our first draw
        const mapCanvas = mapCanvasRef.current;
        const context = mapCanvas.getContext("2d");
        mapContextRef.current = context;
        setCtx(mapContextRef.current);
        context.fillStyle = "rgba(200,250,255,0.5)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        // setStartTile(currentStore.entranceTile);
        // console.log(
        //     "context.canvas.width/height: ",
        //     context.canvas.width,
        //     context.canvas.height
        // );
        togglePaths(false);
        setZoom(1.001);
    };

    useEffect(() => {
        // for dragging the map
        window.addEventListener("pointerup", endTouchCanvas);
        window.addEventListener("mousemove", moveOverCanvas);

        // cleanup this component
        // ??
        return () => {
            window.removeEventListener("pointerup", endTouchCanvas);
            window.removeEventListener("mousemove", moveOverCanvas);
        };
    });

    useEffect(() => {
        drawMap();
    }, [ctx, shoppingList, showingPaths]);

    useEffect(() => {
        /* zoom was changed, 
        resize and reposition canvas and img
        redraw canvas map
        */
        const handleZoomChange = () => {
            console.log("handleZoomChange(), startMapWidth: ", startMapWidth);
            if (!startMapWidth) return;
            // zoom is 1 = 100%
            const zoomRatio = zoom / lastZoom;
            lastZoom = zoom;
            // Calculate Map dimensions

            // setMapWidth(startMapWidth * zoom);
            mapWidth = startMapWidth * zoom;
            // setMapHeight(startMapHeight * zoom);
            mapHeight = startMapHeight * zoom;

            // setTileSize(mapWidth / currentStore.grid.length);
            tileSize = mapWidth / currentStore.grid.length;
            // console.log("tileSize: ", tileSize);
            recenterOnResize(zoomRatio);
            drawMap();
        };
        handleZoomChange();
    }, [zoom]);

    useEffect(() => {
        if (paths.length === 0) {
            setZoom(1);
            // zoom will call drawMap()
        } else {
            drawMap();
        }
    }, [paths]);

    const recenterOnResize = (zoomRatio) => {
        const mapHolder = mapHolderRef.current;
        const mapCanvas = mapCanvasRef.current;
        // Zoom in/out from center of visible image
        const halfW = mapHolder.offsetWidth * 0.5;
        const halfH = mapHolder.offsetHeight * 0.5;

        const mapX = mapCanvas.offsetLeft;
        const mapY = mapCanvas.offsetTop;
        const midX = halfW - mapX;
        const midY = halfH - mapY;

        const newMidX = midX * zoomRatio;
        const newMidY = midY * zoomRatio;

        const newX = halfW - newMidX;
        const newY = halfH - newMidY;

        // console.log("MAP halfW: ", halfW);
        // console.log("MAP mapX: ", mapX);
        // console.log("MAP midX: ", midX);
        // console.log("MAP zoomRatio: ", zoomRatio);
        // console.log("MAP newMidX: ", newMidX);
        // console.log("MAP > newX/Y: ", newX, newY);
        constrainMapXY(newX, newY);
    };

    const dragMap = (xDist, yDist) => {
        // console.log("xyDIst: ", xDist, yDist);
        // console.log(
        //     "mapXY: ",
        //     mapCanvasRef.current.offsetLeft,
        //     mapCanvasRef.current.offsetTop
        // );
        constrainMapXY(
            mapCanvasRef.current.offsetLeft + xDist,
            mapCanvasRef.current.offsetTop + yDist
        );
        setBooleanFlag(!booleanFlag);
    };

    const constrainMapXY = (x, y) => {
        const mapHolder = mapHolderRef.current;
        // const mapCanvas = mapCanvasRef.current;
        const mapImg = mapImgRef.current;
        // Keep map inside mapHolder
        if (x === undefined || y === undefined) {
            x = mapImg.offsetLeft;
            y = mapImg.offsetTop;
        }
        // Constrain x / y to never have gap between map and holder
        // unless map is smaller than holder in that dimension
        const holderW = mapHolder.clientWidth;
        const holderH = mapHolder.clientHeight;
        // const imgW = mapImg.clientWidth;
        // const imgH = mapImg.clientHeight;
        const minX =
            mapWidth < holderW ? (holderW - mapWidth) / 2 : holderW - mapWidth;
        const minY =
            mapHeight < holderH
                ? (holderH - mapHeight) / 2
                : holderH - mapHeight;

        const newX = Math.max(minX, Math.min(0, x));
        const newY = Math.max(minY, Math.min(0, y));
        // console.log("MAP > constrainMapXY: (", x, y, ")", newX, newY);
        // Position mapCanvas and mapImg
        // use state var for mapLeft to force redraw of map canvas & img
        // console.log("mapLeft: ", newX);
        // setMapLeft(newX);
        // setMapTop(newY);
        mapLeft = newX;
        mapTop = newY;
    };

    const changedSlider = (evt) => {
        // console.log("evt.target.value: ", evt.target.value);
        setZoom(evt.target.value);
    };

    const getPointerXY = (evt) => {
        // Relative to map, if map is evt target?

        var rect = mapCanvasRef.current.getBoundingClientRect();
        // var rect = evt.target.getBoundingClientRect();
        var x = evt.clientX - rect.left; //x position within the element.
        var y = evt.clientY - rect.top; //y position within the element.
        return { x, y };
    };

    const startTouchCanvas = (evt) => {
        // console.log("startTouchCanvas: ", evt);
        const mouseXY = getPointerXY(evt);

        // Start Drag
        dragging = true;
        setStartDragPosition(mouseXY);
    };

    const moveOverCanvas = (evt) => {
        if (dragging) {
            // console.log("dragging...");
            // Drag Map
            const mousePos = getPointerXY(evt);
            dragMap(
                mousePos.x - startDragPosition.x,
                mousePos.y - startDragPosition.y
            );
        }
    };

    const endTouchCanvas = (evt) => {
        // console.log("endTouchCanvas");
        dragging = false;
    };

    ////////////////////////
    // DRAWING FUNCTIONS
    ////////////////////////

    const drawMap = () => {
        if (!ctx) return;
        console.log("drawMap()");
        console.log("tileSize: ", tileSize);
        setBooleanFlag(!booleanFlag);
        setTimeout(() => {
            // console.log("drawMap() thinks showingPaths is: ", showingPaths);
            drawGrid();
            if (showingPaths) drawShoppingPath();
            plotShoppingItemsOnMap();
        }, 0);
    };

    const drawGrid = () => {
        if (!ctx) return;
        // console.log("drawGrid(), tileSize: ", tileSize);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.lineWidth = Math.min(tileSize * 0.1, 1);
        const obstacleStrokeColor = "#7894E1";
        const unobstructedStrokeColor = "rgba(0,0,0,0.25)";
        ctx.fillStyle = "#7894E1";

        for (const col of currentStore.grid) {
            for (const tile of col) {
                const x = tile.col * tileSize;
                const y = tile.row * tileSize;
                // Stroke on top of fill
                ctx.beginPath();
                ctx.rect(x, y, tileSize, tileSize);
                if (tile.obstacle && obstaclesVisible) ctx.fill();
                ctx.strokeStyle = tile.obstacle
                    ? obstacleStrokeColor
                    : gridOn ? unobstructedStrokeColor : 'transparent';
                if(!tile.obstacle || obstaclesVisible) ctx.stroke();
            }
        }
    };

    const plotShoppingItemsOnMap = () => {
        if (!ctx) return;
        // const tileSize = ctx.canvas.offsetWidth / currentStore.grid.length;
        // console.log("plotShoppintItemsOnMap(), tileSize: ", tileSize);
        const halfTile = tileSize * 0.5;
        const radius = Math.min(7, Math.max(halfTile * 2, 5));
        // console.log("RADIUS: ",radius);
        // console.log("TILESIZE: ",tileSize);
        ctx.fillStyle = "grey";
        let firstItem = paths.length > 0;
        ctx.lineWidth = Math.max(tileSize * 0.1, 1);
        ctx.strokeStyle = "black";
        const activeItems = shoppingList.filter((item) => item.active);
        for (const item of activeItems) {
            // console.log("ITEM: ", item);
            const x = item.col * tileSize;
            const y = item.row * tileSize;
            // Stroke on top of fill
            ctx.beginPath();
            if (firstItem) {
                if (!item.crossedOff) {
                    ctx.fillStyle = "limegreen";
                    ctx.strokeStyle = "green";
                }
            } else if (item.crossedOff) {
                ctx.fillStyle = "grey";
                ctx.strokeStyle = "white";
            } else {
                ctx.fillStyle = "orange";
                ctx.strokeStyle = "black";
            }

            ctx.arc(
                x + halfTile,
                y + halfTile,
                radius * (firstItem && !item.crossedOff ? 1.5 : 1),
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.stroke();
            if (firstItem) {
                firstItem = false;
            }
        }
    };
    //
    // Toggle Paths Showing
    //
    const togglePaths = (force) => {
        if (force != undefined) {
            setShowingPaths(force);
        } else {
            setShowingPaths(!showingPaths);
        }
    };

    //
    // Toggle Obstacle Tiles Colored In
    //
    const toggleObstacles = () => {
        obstaclesVisible = !obstaclesVisible;
        drawMap();
    };

    //
    // Toggle Grid Overlay on Map
    //
    const toggleGrid = () => {
        gridOn = !gridOn;
        drawMap();
    };

    //
    // Calculate order of items for shortest path
    //
    const calculateOrder = async () => {
        setShowingPaths(true);
        const activeItems = shoppingList.filter((item) => {
            return item.active && !item.crossedOff;
        });
        const inactiveItems = shoppingList.filter((item) => {
            return !item.active || item.crossedOff;
        });

        // Call Pathfinding
        const results = Pathfinding.getShoppingPath(activeItems, currentStore);

        // put active items' order in db
        for (
            let itemIndex = 0;
            itemIndex < results.orderedItems.length;
            itemIndex++
        ) {
            results.orderedItems[itemIndex].sortOrder = itemIndex;
        }

        const response = await fetch(`${APIUrl}/list-items/order/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items: results.orderedItems,
            }),
            credentials: "include",
        });

        const data = await response.json();
        // check for error?
        setPaths(results.paths);
        // join active items with crossed-off & inactive items
        const orderedWholeList = results.orderedItems.concat(inactiveItems);
        updateShoppingList(orderedWholeList);
    };

    const drawShoppingPath = () => {
        for (const path of paths) {
            drawPath(path);
        }
    };

    const drawPath = (pathAr) => {
        // Expects an array of segments
        if (!ctx) return;
        const arrowFrequencyDist = 40;
        let pathDist = 0;
        let drawArrow = false;
        for (const segment of pathAr) {
            pathDist += tileSize;
            // last segment? or had no arrowheads for pathDist?
            if (
                pathDist >= arrowFrequencyDist ||
                segment === pathAr[pathAr.length - 1]
            ) {
                drawArrow = true;
            } else {
                drawArrow = false;
            }
            drawSegment(segment, "yellow", drawArrow);
            if (pathDist >= arrowFrequencyDist) pathDist = 0;
        }
    };

    /*
    PATH SEGMENT
    */

    const drawSegment = (segment, color = "yellow", arrow = false) => {
        if (!ctx) return;
        // Get tile center on canvas
        const h0coord = getTileCenterOnCanvas(segment.fromTile);
        const h1coord = getTileCenterOnCanvas(segment.toTile);
        const strokeWidth = Math.min(2, Math.max(2, Math.ceil(tileSize * 0.3)));
        // console.log("STROKEWIDTH: ", strokeWidth);
        const headlen = strokeWidth * 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(h0coord.x, h0coord.y);
        ctx.lineTo(h1coord.x, h1coord.y);

        if (arrow) {
            // arrow head
            var angle = Math.atan2(
                h1coord.y - h0coord.y,
                h1coord.x - h0coord.x
            );
            // path from corner of head to arrow tip
            ctx.moveTo(
                h1coord.x - headlen * Math.cos(angle - Math.PI / 7),
                h1coord.y - headlen * Math.sin(angle - Math.PI / 7)
            );
            ctx.lineTo(h1coord.x, h1coord.y);
            //path from the tip of arrow to the other side point
            ctx.lineTo(
                h1coord.x - headlen * Math.cos(angle + Math.PI / 7),
                h1coord.y - headlen * Math.sin(angle + Math.PI / 7)
            );
            ctx.fill();
        }

        ctx.closePath();
        if (color) {
            ctx.lineWidth = strokeWidth * 3;
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = "green";
        ctx.stroke();
    };

    const getTileCenterOnCanvas = (tile) => {
        const x = tileSize * tile.col + tileSize * 0.5;
        const y = tileSize * tile.row + tileSize * 0.5;
        return { x, y };
    };

    return (
        <div id="map">
            {/* <div id="loadbar-holder">
                <div id="loadbar" style={{ width: `${progressPercent}%` }} />
            </div> */}
            <div
                ref={mapHolderRef}
                id="canvas-holder"
                // style={{ height: `${mapHolderRef.current.offsetWidth}px` }}
            >
                <canvas
                    ref={mapCanvasRef}
                    id="drawing-board"
                    width={`${mapWidth}`}
                    height={`${mapHeight}`}
                    style={{
                        left: `${mapLeft}px`,
                        top: `${mapTop}px`,
                        borderRadius: booleanFlag ? 1 : 0,
                    }}
                    onPointerDown={startTouchCanvas}
                    onPointerMove={moveOverCanvas}
                    onPointerUp={endTouchCanvas}
                ></canvas>
                <img
                    onLoad={imageLoaded}
                    ref={mapImgRef}
                    style={
                        imageLoadDone
                            ? {
                                  width: `${mapWidth}px`,
                                  height: `${mapHeight}px`,
                                  left: `${mapLeft}px`,
                                  top: `${mapTop}px`,
                              }
                            : {}
                    }
                    src={`/images/${currentStore.mapURL}`}
                    alt="grocery store map"
                    id="map-img"
                />
            </div>
            <input
                ref={zoomSliderRef}
                onChange={changedSlider}
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={zoom}
                className="slider"
                id="zoom-range"
            />
            <div id="activation-buttons">
                <button
                    onPointerDown={(evt) => {
                        togglePaths(false);
                        setTimeout(calculateOrder, 100);
                    }}
                >
                    Calculate Path
                </button>
                <button
                    onPointerDown={(evt) => {
                        togglePaths();
                    }}
                >
                    {showingPaths ? "Hide Paths" : "Show Paths"}
                </button>
                <button
                    onPointerDown={(evt) => {
                        toggleObstacles();
                    }}
                >
                    {obstaclesVisible ? "Clean Map" : "Enhanced Map"}
                </button>
                <button
                    onPointerDown={toggleGrid}
                >
                    {gridOn ? "Hide Grid" : "Show Grid"}
                </button>
            </div>
        </div>
    );
};

export default Map;
