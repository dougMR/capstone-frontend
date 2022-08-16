const Map = ({ currentStore, zoom }) => {
    return (
        // <div id="map">
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
        // </div>
    );
};

export default Map;
