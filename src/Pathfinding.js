/* 

Get called with any necessary arguments - eg. grid, shopping list
Create Waypoints list, from shopping list locations.
Call preferred shortest-route function.  Supply any dependency functions needed by shortest-route-fining function.

Return a path. (Array of Segments)

*/

const secret = "SECRET";
const waypoints = [];
const Pathfinding = {
    sayHello: function () {
        console.log("hello. It's ", secret);
    },
    getPath: function (shoppingList, ctx) {
            for(const item of shoppingList){
                waypoints.push(
                {
                col: item.col,
                diagonal: undefined,
                endSegment: null,
                neighbors: [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
                obstacle: false
                row: 87
                size: 10
                }
                )
            }
    }
};




const orderedWPs = tspShortestByMutation(waypoints);
// Need at least 2 waypoints to draw path
console.log("orderedWaypoints: ", orderedWPs);
for (let wp = 0; wp < orderedWPs.length - 1; wp++) {
    // console.log("wp index: ", wp);
    // console.log(
    //     "orderedWPs[wp]: ",
    //     orderedWPs[wp]
    // );
    // console.log(
    //     "orderedWPs[wp + 1]: ",
    //     orderedWPs[wp + 1]
    // );
    const path = drawPathAtoB(orderedWPs[wp], orderedWPs[wp + 1]);
    if (path) {
        paths.push(path);
        // clearPaths();
    }
    orderedWPs[wp].innerHTML = wp;
    if (wp === orderedWPs.length - 2) {
        orderedWPs[wp + 1].innerHTML = wp + 1;
    }
}
console.log("orderedWPs.length: ", orderedWPs.length);
// Draw all the paths between waypoints
redrawGrid();
for (const path of paths) {
    drawPath(path);
}
/* PATHFINDING */
// A path is an array of segments

const findPathFromAtoB = (A, B) => {
    // A and B are tile/tile objects
    // Find Path from tile A to tile B
    // Returns Array of segments, or null

    // console.log(
    //     "findPathFromAtoB(",
    //     A.col,
    //     ",",
    //     A.row,
    //     ", ",
    //     B.col,
    //     ",",
    //     B.row,
    //     ")"
    // );

    // start from A, get segs to all neighbors
    if (typeof A === "undefined") {
        console.log("A is undefined.");
    }
    A.endSegment = makeSegment(A, A);

    // Keep track of all the segments we put down last iteration
    const lastSegs = [A.endSegment];

    // Handle case A === B
    if (A === B) {
        return lastSegs;
    }

    let foundTarget = false;
    // let iterations = 0;
    let noNewSegs = false;
    do {
        // console.log('lastSegs: ',lastSegs.length);
        const newSegs = [];
        for (let segIndex = 0; segIndex < lastSegs.length; segIndex++) {
            // nextSeg from lastSegs
            const lastSeg = lastSegs[segIndex];
            // console.log("__________________________________");
            // console.log(
            //     "        tile: ",
            //     lastSeg.toTile.col,
            //     ", ",
            //     lastSeg.toTile.row
            // );
            // Branch out to Neighbors
            // Alternate clockwise/counter-clockwise,
            // because *maybe that makes for tighter zig-zags?
            const clockwise = segIndex % 2 === 0;
            // Look for Neighbors (n)
            // console.log(
            //     `   ==== neighbors for ${lastSeg.toTile.col}, ${lastSeg.toTile.row}`
            // );
            const increment = 1;
            // console.log("lastSeg: ", lastSeg);
            for (
                let n = 0;
                n < lastSeg.toTile.neighbors.length;
                n += increment
            ) {
                const nextN = clockwise
                    ? n
                    : lastSeg.toTile.neighbors.length - n - increment;

                nextNeighbor = lastSeg.toTile.neighbors[nextN];
                if (nextNeighbor != null) {
                    const col = lastSeg.toTile.neighbors[nextN].col;
                    const row = lastSeg.toTile.neighbors[nextN].row;
                    nextNeighbor = getTileByIndices(col, row);
                }

                // console.log(nextNeighbor);
                if (
                    nextNeighbor != null &&
                    !nextNeighbor.endSegment &&
                    !nextNeighbor.obstacle
                ) {
                    // console.log('nextNeighbor good so far...');
                    // Clear so far, but also check to
                    // console.log(
                    //     "   ===  next neighbor: ",
                    //     nextNeighbor.col,
                    //     ", ",
                    //     nextNeighbor.row
                    // );
                    // prevent paths from going between corners of 2 diagonally adjacent tiles
                    let notIllegalCorner = true;
                    let isCorner = false;
                    if (nextN % 2 === 1) {
                        isCorner = true;
                        // console.log(`neighbor ${nextN} checkIllegalCorner`);

                        // It's a corner neighbor, get the neighbors just before and after this neighbor
                        const neighbors = lastSeg.toTile.neighbors;
                        const preN =
                            (nextN + neighbors.length - 1) % neighbors.length;
                        const postN = (nextN + 1) % neighbors.length;
                        const preNeighbor = neighbors[preN];
                        const postNeighbor = neighbors[postN];
                        // Is this empty corner between two occupied adjacent tiles?
                        // If so, was either of them just occupied by segment from current tile?

                        // check that no segment crosses from preNeighbor to postNeighbor or vice versa
                        const notCrossedOver =
                            !preNeighbor.endSegment ||
                            !postNeighbor.endSegment ||
                            (preNeighbor.endSegment.fromTile !== postNeighbor &&
                                postNeighbor.endSegment.fromTile !==
                                    preNeighbor);
                        // console.log(
                        //     "preNeighbor: ",
                        //     preNeighbor.col,
                        //     ", ",
                        //     preNeighbor.row
                        // );
                        // console.log(
                        //     "postNeighbor: ",
                        //     postNeighbor.col,
                        //     ", ",
                        //     postNeighbor.row
                        // );
                        // console.log("crossedOver: ", !notCrossedOver);
                        // console.log(
                        //     "preNeighbor.obstacle: ",
                        //     preNeighbor.obstacle
                        // );
                        // console.log(
                        //     "postNeighbor.obstacle: ",
                        //     postNeighbor.obstacle
                        // );
                        // console.log(
                        //     "preNeighbor.endSegment: ",
                        //     preNeighbor.endSegment
                        // );
                        // console.log(
                        //     "postNeighbor.endSegment: ",
                        //     postNeighbor.endSegment
                        // );
                        notIllegalCorner =
                            (notCrossedOver &&
                                (preNeighbor.endSegment ||
                                    postNeighbor.endSegment)) ||
                            !preNeighbor.obstacle ||
                            !postNeighbor.obstacle;
                    }
                    if (notIllegalCorner) {
                        // create a new segment from lastSeg's end tile to neighbor
                        const newSeg = makeSegment(
                            lastSeg.toTile,
                            nextNeighbor,
                            lastSeg,
                            isCorner
                        );
                        // console.log('nextNeighbor approved');
                        nextNeighbor.endSegment = newSeg;
                        // allSegments.push(newSeg);
                        // drawSegment(newSeg, "rgba(0,0,0,.1)");
                        // is nextNeighbor tile B?
                        if (nextNeighbor === B) {
                            // console.log("Found Target!");
                            //
                            // **************
                            // Found Target!
                            // **************
                            //
                            foundTarget = true;
                            const fullPath = getFullPathFromEndSegment(newSeg);
                            // clearPaths();
                            clearSegsFromTiles();
                            return fullPath;
                        } else {
                            // newSeg.draw("rgba(0,0,0,0.1");
                            if (isCorner) {
                                newSegs.push(newSeg);
                            } else {
                                newSegs.unshift(newSeg);
                            }
                        }
                    }
                }
            }
        }
        // console.log(`newSegs.length: ${newSegs.length}`);
        if (newSegs.length === 0) {
            noNewSegs = true;
            // console.log("No New Segs");
            break;
        } else {
            // console.log(">> lastSegs.length: ", lastSegs.length, " <<");

            lastSegs.length = 0;
            lastSegs.push(...newSegs);
        }
        // iterations++;
        // } while (!foundTarget && iterations < 2000 && !noNewSegs);
    } while (!foundTarget && !noNewSegs);
    // console.log("iterations: ", iterations);
    clearSegsFromTiles();
    return null;
};

const drawPathAtoB = (Atile, Btile, drawThisPathOnly = false) => {
    // Find path AtoB and draw it
    const myPath = findPathFromAtoB(Atile, Btile);
    if (!myPath) {
        console.log("Can't get there from here");
    } else {
        if (drawThisPathOnly) clearPaths();
        paths.push(myPath);
        drawPath(myPath);
    }
    return myPath;
};
const drawPath = (pathAr) => {
    // Expects an array of segments
    for (const segment of pathAr) {
        segment.draw("yellow");
    }
};

const clearPaths = () => {
    // console.log('clearPaths()');
    paths.length = 0;
    redrawGrid();
};

const clearSegsFromTiles = () => {
    // console.log("clearSegsFromTiles()");
    for (const col of grid) {
        for (const tile of col) {
            tile.endSegment = null;
        }
    }
};

/*
    PATH SEGMENT
*/

const drawSegment = (segment, color) => {
    // console.log("drawSegment()", segment);
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
    ctx.strokeStyle = color ? color : pink;
    ctx.stroke();
};
const makeSegment = (tile1, tile2, parentSeg = null, diagonal = false) => {
    const segment = {
        fromTile: tile1,
        toTile: tile2,
        isDiagonal: diagonal,
        draw: function (color) {
            // console.log('this: ',this);
            drawSegment(this, color);
        },
        parentSeg,
    };
    return segment;
};
const getFullPathFromEndSegment = (endSeg) => {
    // Get chaing of parents until there is no parent
    const path = [endSeg];
    let parentSeg = endSeg.parentSeg;
    let tooMuch = 0;
    // console.log(endSeg);
    // console.log(`parentSeg: ${parentSeg}`);
    while (parentSeg != null && tooMuch < 1000) {
        path.unshift(parentSeg);
        parentSeg = parentSeg.parentSeg;

        // console.log("parentSeg", parentSeg);
        tooMuch++;
    }
    return path;
};

/*
    END PATH SEGMENT
*/

/* WAYPOINTS */
const orderWaypointsByClosest = (waypoints) => {
    // This assumes startWP and endWP are already in waypoints
    console.log("orderWaypointsByClosest()", waypoints);
    const orderedWPs = [];
    const unorderedWPs = [...waypoints];
    // pull out first WP as startWP, put it in orderedWPs
    let startWP = unorderedWPs.splice(0, 1)[0];
    orderedWPs.push(startWP);
    let tooMuch = 0;
    let nextWP = startWP;
    while (unorderedWPs.length > 1 && tooMuch < 100) {
        // find closest WP of unorderedWPs to startWP
        const closestWP = getClosestWaypoint(nextWP, unorderedWPs);
        // console.log(`closestWP: ${closestWP.col}, ${closestWP.row}`);
        // make that startWP, pull it from unorderedWPs, push it to orderedWPs
        nextWP = closestWP;
        unorderedWPs.splice(unorderedWPs.indexOf(nextWP), 1);
        orderedWPs.push(nextWP);
        // repeat until unorderedWPs has only 1 left, then push that to orderedWPs
        tooMuch++;
    }
    // add the last one
    orderedWPs.push(...unorderedWPs);

    // returned ordered list
    return orderedWPs;
};

const getClosestWaypoint = (Awp, Barray) => {
    console.log("getClosestWaypoint()");
    console.log("Awp", Awp);
    console.log(Barray);
    // params: button, button array
    if (Barray < 1) {
        return null;
    }
    const distances = [];
    for (let b = 0; b < Barray.length; b++) {
        const path = findPathFromAtoB(Awp, Barray[b]);
        console.log(
            `path ${Awp.col},${Awp.row} -> ${Barray[b].col},${Barray[b].row}: `,
            path.length
        );
        if (path === null) {
            console.log("Awp: ", Awp);
            console.log("Barray[b]: ", Barray[b]);
        }
        // console.log('path.length: ',path.length);
        const dist = getPathDistance(path);
        distances.push(dist);
    }
    const min = Math.min(...distances);
    const index = distances.indexOf(min);
    return Barray[index];
};

const getPathDistance = (path) => {
    // Dist is in Segments
    // diagonal Segments count as 1.4 Segments
    let dist = path.length;
    for (const segment of path) {
        if (segment.isDiagonal) {
            dist += 0.4; // difference of hypotenuse and side length
        }
    }
    return dist;
};

const getShortestRouteByClosestBothEnds = (tiles) => {
    // This gets each next closest tile, starting from start and end, then sticking result paths together

    // THIS APPROACH DOES NOT WORK WELL.
    // RESULTING PATH IS NOT LIKELY TO BE OPTIMIZED

    // tiles is an array
    // returns an array of tiles in 'optimized' order
    // first and last tiles remain first and last

    //Start with start and end points,
    //alternate between them, getting each next closest point,
    //until all points are taken,
    // then connect the two end points

    const orderedWPfromStart = [entranceTile];
    const orderedWPfromEnd = [checkoutTile];
    const unorderedWPs = [...tiles];
    let tooMuch = 0;
    let nextWP = entranceTile;
    let endWP = checkoutTile;
    while (unorderedWPs.length > 0 && tooMuch < 100) {
        if (nextWP === undefined) {
            console.log("getShortestRoute > nextWP: ", nextWP);
            console.log("unorderedWPs.length: ", unorderedWPs.length);
        }
        // find closest WP of unorderedWPs to nextWP
        // make that nextWP, pull it from unorderedWPs, push it to orderedWPs
        nextWP = getClosestWaypoint(nextWP, unorderedWPs);
        unorderedWPs.splice(unorderedWPs.indexOf(nextWP), 1);
        orderedWPfromStart.push(nextWP);

        // Do the same from endWP
        if (unorderedWPs.length > 1) {
            endWP = getClosestWaypoint(endWP, unorderedWPs);
            unorderedWPs.splice(unorderedWPs.indexOf(endWP), 1);
            orderedWPfromEnd.push(endWP);
        } else if (unorderedWPs.length > 0) {
            orderedWPfromEnd.push(unorderedWPs[0]);
        }
        tooMuch++;
    }
    // Reverse orderedWPfromEnd, and add it to the end of orderedWPfromStart
    orderedWPfromEnd.reverse();
    orderedWPs = [...orderedWPfromStart, ...orderedWPfromEnd];
    // returned ordered list
    return orderedWPs;
};

const getShortestRouteByClosest = (tiles) => {
    const orderedWPs = [entranceTile];
    const unorderedWPs = [...tiles];
    let tooMuch = 0;
    let nextWP = entranceTile;
    console.log("entranceTile: ", entranceTile);
    while (unorderedWPs.length > 0 && tooMuch < 100) {
        // find closest WP of unorderedWPs to nextWP
        // make that nextWP, pull it from unorderedWPs, push it to orderedWPs
        nextWP = getClosestWaypoint(nextWP, unorderedWPs);
        unorderedWPs.splice(unorderedWPs.indexOf(nextWP), 1);
        orderedWPs.push(nextWP);
        tooMuch++;
    }
    orderedWPs.push(checkoutTile);
    return orderedWPs;
};

const getTileByIndices = (colIndex, rowIndex) => {
    // console.log("colIndex, RowIndex: ",colIndex,rowIndex);
    // ?? Any reason for this function, when we can just get it directly from currentStore.grid[colIndex][rowIndex]?
    return currentStore.grid[colIndex][rowIndex];
};

export default Pathfinding;
