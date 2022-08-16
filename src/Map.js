// import Pathfinding from "./Pathfinding";
import { useEffect, useState, useRef } from "react";
const Map = ({ currentStore, shoppingList }) => {
    // console.log('currentStore: ',currentStore);
    const [zoom, setZoom] = useState(1);
    const [lastZoom, setLastZoom] = useState(1);
    const [tileSize, setTileSize] = useState();
    const [imageLoadDone, setImageLoadDone] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [startDragPosition, setStartDragPosition] = useState({});
    const [mapWidth, setMapWidth] = useState(300);
    const [mapHeight, setMapHeight] = useState(300);
    const [mapLeft, setMapLeft] = useState(0);
    const [mapTop, setMapTop] = useState(0);

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
        context.fillStyle = "rgba(200,250,255,0.5)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        console.log(
            "context.canvas.width/height: ",
            context.canvas.width,
            context.canvas.height
        );
        // if (imageLoadDone) {
        //     drawGrid();
        // } else {
        //     console.log("imageLoadDone: ", imageLoadDone);
        // }
    };

    // useEffect(() => {
    //     drawGrid();
    // });

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
    }, []);

    useEffect(()=>{
        setTimeout(()=>{
            drawGrid();
            plotShoppingItemsOnMap();
        },0);
    },[shoppingList]);

    useEffect(() => {
        /* zoom was changed, 
        resize and reposition canvas and img
        redraw canvas map
        */
        const handleZoomChange = () => {
            // zoom is 1 = 100%

            const zoomChange = zoom / lastZoom;
            setLastZoom(zoom);

            // console.log("ZOOM: ", zoom);
            // console.log("startMapWidth: ", startMapWidth.current);
            // console.log("imageLoadDone: ", imageLoadDone);
            // Calculate Map dimensions
            setMapWidth(startMapWidth.current * zoom);
            setMapHeight(startMapHeight.current * zoom);

            recenterOnResize(zoomChange);
            // recalcTileSize();
            // redrawGrid(true);
            // if (imageLoadDone) {
            //     drawGrid();
            // } else {
            //     console.log("imageLoadDone: ", imageLoadDone);
            // }
            setTimeout(()=>{
                drawGrid();
                plotShoppingItemsOnMap();
            },0);
            
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

    const drawGrid = () => {
        const ctx = mapContextRef.current;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const tileSize = ctx.canvas.offsetWidth / currentStore.grid.length;
        ctx.lineWidth = Math.min(tileSize * 0.1, 1);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
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
    }

    const plotShoppingItemsOnMap = () => {
        const ctx = mapContextRef.current;
        const tileSize = ctx.canvas.offsetWidth / currentStore.grid.length;
        const halfTile = tileSize * 0.5;
        ctx.fillStyle = "red";
        let firstItem = true;
        ctx.lineWidth = Math.min(tileSize * 0.1, 1);
        ctx.strokeStyle = "yellow";
        for(const item of shoppingList){
            const x = item.col * tileSize;
                const y = item.row * tileSize;
                // Stroke on top of fill
                ctx.beginPath();
                if( firstItem ) {
                    console.log('firstItem: ',item);
                    ctx.fillStyle = "limegreen";
                    firstItem = false;
                } else {
                    ctx.fillStyle = "red";
                }
                
                // ctx.rect(x, y, tileSize, tileSize);
                ctx.arc(x+halfTile, y+halfTile, halfTile*1.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
        }
    }

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
        </div>
    );
};

export default Map;
