import Pathfinding from "./Pathfinding";
import { useEffect, useState, useRef } from "react";
let startMapWidthVar, startMapHeightVar;
let tileSize = 0;
const Map = ({ currentStore, shoppingList }) => {
    // console.log('currentStore: ',currentStore);
    const [zoom, setZoom] = useState(0);
    const [lastZoom, setLastZoom] = useState(0);
    // const [tileSize, setTileSize] = useState(0);
    const [imageLoadDone, setImageLoadDone] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [startDragPosition, setStartDragPosition] = useState({});
    const [mapWidth, setMapWidth] = useState(300);
    const [mapHeight, setMapHeight] = useState(300);
    const [mapLeft, setMapLeft] = useState(0);
    const [mapTop, setMapTop] = useState(0);
    const [paths, setPaths] = useState([]);
    const [ctx,setCtx] = useState(null);

    const startMapWidth = useRef(0);
    const startMapHeight = useRef(0);
    const zoomSliderRef = useRef(null);
    const mapImgRef = useRef(null);
    const mapHolderRef = useRef(null);
    const mapCanvasRef = useRef(null);
    const mapContextRef = useRef(null);

    

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

        startMapWidthVar = mapImg.offsetWidth;
        startMapHeightVar = mapImg.offsetHeight;
        console.log('startMapWidthVar: ',startMapWidthVar);
        console.log('startMapHeightVar: ',startMapHeightVar);

        console.log("startMapWidth, height: ", mapImg.width, mapImg.height);
        startMapWidth.current = mapImg.offsetWidth;
        startMapHeight.current = mapImg.offsetHeight;
        setMapWidth(startMapWidth.current);
        setMapHeight(startMapHeight.current);
        console.log("startMapWidth, height: ", mapImg.width, mapImg.height);
        setImageLoadDone(true);

        //Our first draw
        const mapCanvas = mapCanvasRef.current;
        const context = mapCanvas.getContext("2d");
        mapContextRef.current = context;
        setCtx(mapContextRef.current);
        context.fillStyle = "rgba(200,250,255,0.5)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        console.log(
            "context.canvas.width/height: ",
            context.canvas.width,
            context.canvas.height
        );
        setZoom(1);

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
    }, [ctx, shoppingList]);


    useEffect(() => {
        /* zoom was changed, 
        resize and reposition canvas and img
        redraw canvas map
        */
        const handleZoomChange = () => {
            console.log("handleZoomChange(), startMapWidthVar: ",startMapWidthVar);
            if(!startMapWidthVar)return;
            // zoom is 1 = 100%
            const zoomChange = zoom / lastZoom;
            setLastZoom(zoom);
            // Calculate Map dimensions
            // console.log("PRE-ZOOM MAPWIDTH: ",mapWidth);
            // setMapWidth(startMapWidth.current * zoom);
            // setMapHeight(startMapHeight.current * zoom);
            // console.log("ZOOM: ",zoom);
            // console.log("START MAP WIDTH: ",startMapWidth.current);
            // console.log("TARGET MAP WIDTH: ",startMapWidth.current * zoom);
            // console.log("post-ZOOM MAPWIDTH: ",mapWidth);
            // recenterOnResize(zoomChange);
            // setTileSize(mapWidth / currentStore.grid.length);

            console.log("PRE-ZOOM MAPWIDTH: ",mapWidth);
            console.log("ZOOM: ",zoom);
            console.log("START MAP WIDTH: ",startMapWidthVar);
            console.log("TARGET MAP WIDTH: ",startMapWidthVar * zoom);
            setMapWidth(startMapWidthVar * zoom);
            setMapHeight(startMapHeightVar * zoom);
            console.log("post-ZOOM MAPWIDTH: ",mapWidth);
            recenterOnResize(zoomChange);
            console.log('currentStore.grid.length: ',currentStore.grid.length);
            // setTileSize(mapWidth / currentStore.grid.length);
            tileSize = mapWidth / currentStore.grid.length;
            console.log("tileSize: ",tileSize);
            drawMap();
        };
        handleZoomChange();
    }, [zoom]);

    const recenterOnResize = (zoomChangeRatio) => {
        const mapHolder = mapHolderRef.current;
        const mapCanvas = mapCanvasRef.current;
        // Zoom in/out from center of visible image
        const halfW = mapHolder.offsetWidth * 0.5;
        const halfH = mapHolder.offsetHeight * 0.5;

        const mapX = mapCanvas.offsetLeft;
        const mapY = mapCanvas.offsetTop;
        const midX = halfW - mapX;
        const midY = halfH - mapY;

        const newMidX = halfW - midX * zoomChangeRatio;
        const newMidY = halfH - midY * zoomChangeRatio;
        constrainMapXY(newMidX, newMidY);
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
    };

    const constrainMapXY = (x, y) => {
        const mapHolder = mapHolderRef.current;
        const mapCanvas = mapCanvasRef.current;
        const mapImg = mapImgRef.current;
        // Keep map inside mapHolder
        if (x === undefined || y === undefined) {
            x = mapImg.offsetLeft;
            y = mapImg.offsetTop;
        }
        // Constrain x / y to never have gap between map and holder
        // unless map is smaller than holder in that dimension
        const minX = mapHolder.clientWidth - mapImg.clientWidth;
        const minY = mapHolder.clientHeight - mapImg.clientHeight;
        const newX = Math.max(minX, Math.min(0, x));
        const newY = Math.max(minY, Math.min(0, y));

        // Position mapCanvas and mapImg
        setMapLeft(newX);
        setMapTop(newY);
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
        console.log("startTouchCanvas: ", evt);
        const mouseXY = getPointerXY(evt);

        // Start Drag
        setDragging(true);
        setStartDragPosition(mouseXY);
    };

    const moveOverCanvas = (evt) => {
        if (dragging) {
            console.log("dragging...");
            // Drag Map
            const mousePos = getPointerXY(evt);
            dragMap(
                mousePos.x - startDragPosition.x,
                mousePos.y - startDragPosition.y
            );
        }
    };

    const endTouchCanvas = (evt) => {
        console.log("endTouchCanvas");
        setDragging(false);
    };

    ////////////////////////
    // DRAWING FUNCTIONS
    ////////////////////////

    const drawMap = () => {
        if(!ctx)return;
        setTimeout(() => {
            drawGrid();
            plotShoppingItemsOnMap();
            drawShoppingPath();
        }, 0);
    };

    const drawGrid = () => {
        if (!ctx) return;
        console.log('drawGrid(), tileSize: ',tileSize);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.lineWidth = Math.min(tileSize * 0.1, 1);
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.fillStyle = "#333";

        for (const col of currentStore.grid) {
            for (const tile of col) {
                const x = tile.col * tileSize;
                const y = tile.row * tileSize;
                // Stroke on top of fill
                ctx.beginPath();
                ctx.rect(x, y, tileSize, tileSize);
                if (tile.obstacle) ctx.fill();
                ctx.stroke();
            }
        }
    };

    const plotShoppingItemsOnMap = () => {
        if (!ctx) return;
        // const tileSize = ctx.canvas.offsetWidth / currentStore.grid.length;
        console.log('plotShoppintItemsOnMap(), tileSize: ',tileSize);
        const halfTile = tileSize * 0.5;
        const radius = Math.max(halfTile * 2, 5);
        // console.log("RADIUS: ",radius);
        // console.log("TILESIZE: ",tileSize);
        ctx.fillStyle = "grey";
        let firstItem = true;
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
                    firstItem = false;
                }
            } else if (item.crossedOff) {
                ctx.fillStyle = "grey";
                ctx.strokeStyle = "white";
            } else {
                ctx.fillStyle = "orange";
            }

            ctx.arc(x + halfTile, y + halfTile, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    };

    const calculatePath = () => {
        const store = currentStore;
        const activeItems = shoppingList.filter((item) => {
            return item.active && !item.crossedOff;
        });
        console.log("ACTIVE ITEMS: ",activeItems);
        const entranceTile = currentStore.entranceTile;
        const thePaths = Pathfinding.getShoppingPath(
            activeItems,
            store,
            entranceTile
        );
        setPaths(thePaths);
        console.log("MAP PATHS: ", paths);
        drawMap();
    };



    const drawShoppingPath = () => {
        console.log("drawShoppingPaths(): ", paths.length);
        for (const path of paths) {
            drawPath(path);
        }
    };

    const drawPath = (pathAr) => {
        // Expects an array of segments
        if (!ctx) return;
        for (const segment of pathAr) {
            drawSegment(segment, "yellow");
        }
    };

    /*
    PATH SEGMENT
    */

    const drawSegment = (segment, color) => {
        if (!ctx) return;
        // Get tile center on canvas
        const h0coord = getTileCenterOnCanvas(segment.fromTile);
        const h1coord = getTileCenterOnCanvas(segment.toTile);
        const strokeWidth = Math.ceil(tileSize * 0.1);
        const headlen = strokeWidth * 2;
        ctx.beginPath();
        ctx.moveTo(h0coord.x, h0coord.y);
        ctx.lineTo(h1coord.x, h1coord.y);

        // arrow head
        var angle = Math.atan2(h1coord.y - h0coord.y, h1coord.x - h0coord.x);
        // ctx.moveTo(tox, toy);
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

        ctx.closePath();
        if (color) {
            ctx.lineWidth = strokeWidth * 3;
            ctx.strokeStyle = "rgba(0,0,0,0.6)";
            ctx.stroke();
        }
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = color ? color : "pink";
        ctx.stroke();
    };

    const getTileCenterOnCanvas = (tile) => {
        // console.log('getTileCenterOnCanvas: ',tile);
        const x = tileSize * tile.col + tileSize * 0.5;
        const y = tileSize * tile.row + tileSize * 0.5;
        return { x, y };
    };

    return (
        <div id="map">
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
                    style={{ left: `${mapLeft}px`, top: `${mapTop}px` }}
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
                max="3"
                step="0.1"
                value={zoom}
                className="slider"
                id="zoom-range"
            />
            <button onPointerDown={calculatePath}>calculate path</button>
        </div>
    );
};

export default Map;
