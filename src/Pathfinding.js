/* 

Get called with any necessary arguments - eg. grid, shopping list
Create Waypoints list, from shopping list locations.
Call preferred shortest-route function.  Supply any dependency functions needed by shortest-route-fining function.

Return a path. (Array of Segments)

*/

const secret = "SECRET";
const waypoints = [];
const paths = [];
let currentStore = null;
let entranceTile, checkoutTile;
const distanceLookupTable = [];
const PathfindingFn = (setProgressPercent) => {
    // Need at least 2 waypoints to draw path
    // console.log("orderedWaypoints: ", orderedWPs);
    // for (let wp = 0; wp < orderedWPs.length - 1; wp++) {
    //     // console.log("wp index: ", wp);
    //     // console.log(
    //     //     "orderedWPs[wp]: ",
    //     //     orderedWPs[wp]
    //     // );
    //     // console.log(
    //     //     "orderedWPs[wp + 1]: ",
    //     //     orderedWPs[wp + 1]
    //     // );
    //     const path = findPathFromAtoB(orderedWPs[wp], orderedWPs[wp + 1]);
    //     if (path) {
    //         paths.push(path);
    //         // clearPaths();
    //     }
    //     // orderedWPs[wp].innerHTML = wp;
    //     // if (wp === orderedWPs.length - 2) {
    //     //     orderedWPs[wp + 1].innerHTML = wp + 1;
    //     // }
    // }

    /* PATHFINDING */
    // A path is an array of segments

    const findPathFromAtoB = (A, B) => {
        // console.log("=== findPathFromAtoB ");
        // console.log("A: ", A);
        // console.log("B: ", B);
        // A and B are tile/tile objects
        // Find Path from tile A to tile B
        // Returns Array of segments, or null

        // start from A, get segs to all neighbors
        if (typeof A === "undefined") {
            console.log("A is undefined.");
        }
        A.endSegment = makeSegment(A, A);

        // Keep track of all the segments we put down last iteration
        const lastSegs = [A.endSegment];

        // console.log("LAST SEG: ", lastSegs[0]);

        // Handle case A === B
        if (A === B) {
            return lastSegs;
        }

        let foundTarget = false;
        let noNewSegs = false;
        do {
            const newSegs = [];
            // Loop through lastSegs, branching out from each segment laid down last iteration.
            for (let segIndex = 0; segIndex < lastSegs.length; segIndex++) {
                // next Segment from lastSegs
                const lastSeg = lastSegs[segIndex];

                // Branch out to Neighbors
                // Alternate clockwise/counter-clockwise,
                // because *maybe that makes for tighter zig-zags?
                const clockwise = segIndex % 2 === 0;
                // Look for Neighbors (n)
                const increment = 1;
                for (
                    let n = 0;
                    n < lastSeg.toTile.neighbors.length;
                    n += increment
                ) {
                    const nextN = clockwise
                        ? n
                        : lastSeg.toTile.neighbors.length - n - increment;

                    let nextNeighbor = lastSeg.toTile.neighbors[nextN];
                    if (nextNeighbor != null) {
                        const col = lastSeg.toTile.neighbors[nextN].col;
                        const row = lastSeg.toTile.neighbors[nextN].row;
                        nextNeighbor = getTileByIndices(col, row);
                    }

                    if (
                        // Check if nextNeighbor tile is clear
                        nextNeighbor != null &&
                        !nextNeighbor.endSegment &&
                        !nextNeighbor.obstacle
                    ) {
                        // Clear so far, but also check to
                        // prevent paths from going between corners of 2 diagonally adjacent (occupied) tiles
                        let notIllegalCorner = true;
                        let isCorner = false;
                        if (nextN % 2 === 1) {
                            isCorner = true;
                            // It's a corner neighbor, get the neighbors just before and after this neighbor
                            const neighbors = lastSeg.toTile.neighbors;
                            const preN =
                                (nextN + neighbors.length - 1) %
                                neighbors.length;
                            const postN = (nextN + 1) % neighbors.length;
                            const preNeighbor = neighbors[preN];
                            const postNeighbor = neighbors[postN];
                            // Is this empty corner between two occupied adjacent tiles?
                            // If so, was either of them just occupied by segment from current tile?

                            // check that no segment crosses from preNeighbor to postNeighbor or vice versa
                            const notCrossedOver =
                                !preNeighbor.endSegment ||
                                !postNeighbor.endSegment ||
                                (preNeighbor.endSegment.fromTile !==
                                    postNeighbor &&
                                    postNeighbor.endSegment.fromTile !==
                                        preNeighbor);

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
                            // newSeg.draw("pink");
                            // nextNeighbor approved.
                            nextNeighbor.endSegment = newSeg;
                            // is nextNeighbor tile B?
                            // if (nextNeighbor === B) {
                            if (
                                nextNeighbor.col === B.col &&
                                nextNeighbor.row === B.row
                            ) {
                                //
                                // **************
                                // Found Target!
                                // **************
                                //
                                // console.log("FOUND TARGET");
                                foundTarget = true;
                                const fullPath =
                                    getFullPathFromEndSegment(newSeg);
                                clearSegsFromTiles();

                                return fullPath;
                            } else {
                                // Not done yet...
                                // put every other segment at beginning or end of newSegs[]
                                // this just helps paths look a little more organic
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
            if (newSegs.length === 0) {
                // No new Segments. Dead ended.  Break out of loop and return null.
                console.log("DEAD END: ", lastSegs.length);
                noNewSegs = true;
                break;
            } else {
                // Keep going
                // console.log("KEEP GOING, ", newSegs.length);
                lastSegs.length = 0;
                lastSegs.push(...newSegs);
            }
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
            // paths.push(myPath);

            // drawPath(myPath);
        }
        return myPath;
    };

    const clearPaths = () => {
        // console.log('clearPaths()');
        paths.length = 0;
        // redrawGrid();
    };

    const clearSegsFromTiles = () => {
        // console.log("clearSegsFromTiles()");
        for (const col of currentStore.grid) {
            for (const tile of col) {
                tile.endSegment = null;
            }
        }
    };

    const makeSegment = (tile1, tile2, parentSeg = null, diagonal = false) => {
        const segment = {
            fromTile: tile1,
            toTile: tile2,
            isDiagonal: diagonal,
            // draw: function (color) {
            //     // console.log('this: ',this);
            //     drawSegment(this, color);
            // },
            parentSeg,
        };
        return segment;
    };
    const getFullPathFromEndSegment = (endSeg) => {
        // Get chain of parents until there is no parent
        const path = [endSeg];
        let parentSeg = endSeg.parentSeg;
        let tooMuch = 0;
        const safetyEscape = 3000;
        while (parentSeg != null && tooMuch < safetyEscape) {
            // add parentSeg to beginning of path
            path.unshift(parentSeg);
            parentSeg = parentSeg.parentSeg;
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
        const orderedWPs = [...orderedWPfromStart, ...orderedWPfromEnd];
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

    /* 
----------------------------------------------------
// With help from GENETIC ALGORITM TUTORIAL: https://www.youtube.com/watch?v=M3KTWnTrU_c
*/

    //
    // This script uses traveling salesperson problem (TSP) to look for shortest route
    //

    const tspShortestByMutation = (waypoints) => {
        console.log("tspShortestByMutation()");
        // Get total distance for a set of waypoints (tiles)
        // waypoints does not include entrance, checkout

        //
        // CREATE DISTANCE LOOKUP TABLE
        //
        const waypointDistanceTable = [];
        const createDistanceLookupTable = () => {
            const startCreateLookup = performance.now();
            const wps = addStartAndEnd(waypoints);
            // Calculate distance from each waypoint to every other
            for (let wp1 = 0; wp1 < wps.length - 1; wp1++) {
                if (waypointDistanceTable[wp1] === undefined) {
                    waypointDistanceTable[wp1] = [];
                }
                for (let wp2 = wp1 + 1; wp2 < wps.length; wp2++) {
                    const path = findPathFromAtoB(wps[wp1], wps[wp2]);
                    const dist = path === null ? null : getPathDistance(path);
                    waypointDistanceTable[wp1][wp2] = dist;
                }
            }
            console.log(
                "Lookup Creation Time: ",
                performance.now() - startCreateLookup
            );
        };

        //
        // GET DISTANCE FROM WAYPOINT LOOKUP TABLE
        //
        const lookupDistance = (index1, index2) => {
            if (index1 > index2) {
                const temp = index1;
                index1 = index2;
                index2 = temp;
            }
            return waypointDistanceTable[index1][index2];
        };

        const getWaypointsDistance = (tiles, order) => {
            // console.log("getWaypointsDistance()");
            // tiles = addStartAndEnd(tiles);
            // order = addStartEndIndexes(order);
            let dist = 0;
            for (let o = 0; o < order.length - 1; o++) {
                const tileAIndex = order[o];
                // const tileA = tiles[tileAIndex];
                const tileBIndex = order[o + 1];
                // const tileB = tiles[tileBIndex];
                // console.log('findPathFromAtoB...');
                // const startTime = performance.now();
                // const path = findPathFromAtoB(tileA, tileB);
                // const path = lookupPathFromAtoB(tileA, tileB);
                // console.log("AtoB time: ", performance.now() - startTime);
                // paths.push(path);
                // drawDotAtTile(tileB);
                // drawPath(path);
                // console.log("PATH: ", path);
                // dist += getPathDistance(path);
                // dist += lookupDistance(tileA, tileB);
                dist += lookupDistance(tileAIndex, tileBIndex);
            }
            return dist;
        };

        const reorderWaypoints = (tiles, order) => {
            tiles = addStartAndEnd(tiles);
            order = addStartEndIndexes(order);
            const newPath = [];
            for (let o = 0; o < order.length; o++) {
                const nextIndex = order[o];
                newPath[o] = tiles[nextIndex];
            }
            return newPath;
        };

        const swap = (vals, i, j) => {
            const temp = vals[i];
            vals[i] = vals[j];
            vals[j] = temp;
        };

        const shuffle = (array, num) => {
            if (array.length < 2) return;
            // console.log("shuffle: ", array);
            for (let n = 0; n < num; n++) {
                let indexA = Math.floor(Math.random() * array.length);
                let indexB;
                do {
                    indexB = Math.floor(Math.random() * array.length);
                    // console.log('indexA/B: ',indexA,indexB);
                } while (indexB === indexA);
                swap(array, indexA, indexB);
            }
        };

        const checkSwapEvery2Points = (order) => {
            console.log("checkSwapEvery2Points()");
            // with every pair of points,
            // check if dist is shorter by swapping them
            let newOrder = [...order];
            let foundShorter = false;

            const startCheck = performance.now();
            for (let i = 0; i < order.length; i++) {
                for (let j = i + 1; j < order.length; j++) {
                    const swappedOrder = [...newOrder];
                    swap(swappedOrder, i, j);

                    const dist = getWaypointsDistance(waypoints, swappedOrder);
                    if (dist < shortestDist) {
                        console.log(
                            "*** checkSwap FOUND SHORTER DISTANCE ",
                            dist,
                            " ***"
                        );
                        shortestDist = dist;
                        bestOrder = [...swappedOrder];
                        newOrder = [...swappedOrder];
                        foundShorter = true;
                    }
                }
            }
            console.log("checkTime: ", performance.now() - startCheck);
            if (foundShorter) {
                // set order to newOrder
                console.log(" ------------ checkSwap found improvemnet");
                order.length = 0;
                order.push(...newOrder);
                return true;
            }
            return false;
        };

        const checkSwapEvery2PointsOfPopulation = () => {
            console.log("checkSwapEvery2PointsOfPopulation()");
            for (let p = 0; p < population.length; p++) {
                // DR 9/3/22 - too expensive, make it less likely to run
                const rand = Math.random();

                if (rand < 0.1) {
                    console.log("Math.random(): ", rand);
                    checkSwapEvery2Points(population[p]);
                }
            }
        };

        const addStartAndEnd = (path) => {
            return [startWP, ...path, endWP];
        };

        const addStartEndIndexes = (thisOrder) => {
            return [startIndex, ...thisOrder, endIndex];
        };
        const stripStartEndIndexes = (thisOrder) => {
            const newOrder = [...thisOrder];
            newOrder.pop();
            newOrder.shift();
            return newOrder;
        };

        const calculateFitness = () => {
            console.log("calculateFitness()");
            // look at each order in population
            for (let p = 0; p < population.length; p++) {
                const dist = getWaypointsDistance(waypoints, population[p]);
                // console.log("dist: ", dist);
                // let numTries = 0;
                // const minLoops = 2;
                // while (
                //     checkSwapEvery2Points(population[p]) ||
                //     numTries < minLoops
                // ) {
                //     numTries++;
                // }
                if (dist < shortestDist) {
                    shortestDist = dist;
                    console.log(
                        "------------- found shorter dist -------------"
                    );
                    // only checkSwap when new shortestDist is found

                    while (checkSwapEvery2Points(population[p])) {
                        // just keep doing that until it doesn't improve
                        // console.log(
                        //     "try# " +
                        //         tries +
                        //         "checkSwap found shorter path: " +
                        //         dist
                        // );
                    }

                    bestOrder = [...population[p]];
                    numMutations = 1;
                } else {
                    // no shortest dist found, increase mutations
                    // numMutations++;
                    numMutations = Math.min(numMutations + 1, order.length);
                }
                fitness[p] = dist === 0 ? 0 : 1 / dist;
            }
        };

        const normalizeFitness = () => {
            //  for each value, set it to a fraction, which is its percentage of the total value
            let sum = 0;
            for (let f = 0; f < fitness.length; f++) {
                sum += fitness[f];
            }
            for (let f = 0; f < fitness.length; f++) {
                fitness[f] = fitness[f] / sum;
            }
        };

        const pickOneByFitness = () => {
            // returns random order from population, weighted by fitness
            let index = 0;
            let r = Math.random();

            while (r > 0) {
                r = r - fitness[index];
                // console.log('r: ',r);
                index++;
            }
            index--;
            return [...population[index]];
        };

        const nextGeneration = () => {
            // repopulate population via mutations
            const newPopulation = [];
            // ordersTried.length = 0;
            // foundRepeat = 0;
            // lookedForRepeat = 0;
            // let numChecks = 0;
            // let testOrderCollision = 0;
            for (let p = 0; p < population.length; p++) {
                // const newOrder = [...bestOrder];
                const oldOrder = [...population[p]];
                const newOrder = pickOneByFitness();
                // const orderA = pickOneByFitness(population);
                // const orderB = pickOneByFitness(population);
                // const order = crossover(orderA, orderB);
                // shuffle(newOrder, numMutations);
                // newPopulation[p] = newOrder;

                // reset ordersTried.
                // it gets too long, but clearing it here we can check just that newPopulation doesn't repeat orders

                let loops = 0;
                do {
                    // numChecks++;
                    shuffle(newOrder, numMutations);
                    loops++;
                } while (
                    checkOrderAlreadyTried(newOrder) &&
                    loops < maxCheckNewOrderLoops
                );
                console.log("loops: ", loops, "vs", maxCheckNewOrderLoops);
                // if (loops + 2 < maxCheckNewOrderLoops) {
                if (
                    getWaypointsDistance(waypoints, newOrder) <
                    getWaypointsDistance(waypoints, oldOrder)
                ) {
                    newPopulation[p] = newOrder;
                } else {
                    newPopulation[p] = oldOrder;
                    // console.log("no new order for this population");
                }
                // newPopulation[p] = newOrder;
                // testOrderCollision += loops-1;
            }
            // console.log(testOrderCollision, " Tried Same Order");
            // console.log('numChecks: ',numChecks);
            population.length = 0;
            population.push(...newPopulation);
            // console.log('population.length 2: ',population.length);
        };

        const foundUsedOrder = () => {
            foundRepeat++;
        };
        const checkOrderAlreadyTried = (order) => {
            for (const num of order) {
                if (typeof num !== "number") {
                    console.log("illegal order");
                }
            }
            let nextNestedArray = ordersTried;
            for (let i = 0; i < order.length; i++) {
                const index = order[i];
                if (i < order.length - 1) {
                    // not final index
                    if (!Array.isArray(nextNestedArray[index])) {
                        // No array here yet
                        nextNestedArray[index] = [];
                    }
                    nextNestedArray = nextNestedArray[index];
                } else {
                    // reached endpoint, check if this order has been used yet
                    lookedForRepeat++;
                    if (typeof nextNestedArray[index] != "number") {
                        // First time here
                        nextNestedArray[index] = 1;
                        uniqueOrdersTried++;
                        // if (uniqueOrdersTried >= maxTries) {
                        //     evolveRunning = false;
                        // }
                        return false;
                    } else {
                        // Been here before
                        foundUsedOrder();
                        nextNestedArray[index]++;
                        return true;
                    }
                    // console.log("nextNestedArray[index]", nextNestedArray[index]);
                }
            }
        };

        // Store Entrance
        // let startWP = getTileByIndices(numColumns - 1, numRows - 1);
        let startWP = currentStore.entranceTile;
        // Checkout
        // let endWP = getTileByIndices(Math.floor(numColumns / 2), numRows - 1);
        let endWP = currentStore.checkoutTile;

        // For keeping track of orders already tried
        let lookedForRepeat = 0;
        let foundRepeat = 0;
        let uniqueOrdersTried = 0;
        const ordersTried = [];

        // let maxTries = Math.pow(Math.ceil(waypoints.length * 0.5), 2);
        let maxTries = Math.ceil(waypoints.length * 3);
        maxTries = Math.min(8, maxTries);
        const populationNum = maxTries * maxTries;
        // console.log(
        //     "(maxTries*maxTries) / waypoints.length: ",
        //     (maxTries * maxTries) / waypoints.length
        // );
        const maxCheckNewOrderLoops = Math.pow(waypoints.length * 0.5, 2);
        let numMutations = 1;

        // population of orders
        const population = [];
        // fitness rates each population order by dist (shorter better)
        const fitness = [];
        let tries = 0;

        let order = [];
        for (let o = 0; o < waypoints.length + 2; o++) {
            order[o] = o;
        }

        const startIndex = 0;
        const endIndex = order.length - 1;
        order = stripStartEndIndexes([...order]);
        console.log("waypoints: ", waypoints);
        shuffle(order, order.length);
        console.log("order: ", order);

        // Create Lookup Table for all Waypoints to all Waypoints
        createDistanceLookupTable();

        let shortestDist = getWaypointsDistance(waypoints, order);
        console.log(" *** START shortestDistance: ", shortestDist);

        // Check before starting,
        // if maxTries * population >= permutations,
        // do permutations instead
        const permutations = factorialize(order.length - 2);
        if (maxTries * population.length > permutations) {
            maxTries = permutations;
        }

        console.log("maxTries, ", maxTries);
        console.log("populationNum: ", populationNum);

        let bestOrder = [...order];
        console.log("bestOrder: ", bestOrder);
        // set random populations
        for (let p = 0; p < populationNum; p++) {
            population[p] = [...order];
            // console.log("p1: ", population[p]);
            shuffle(population[p], 10);
            // console.log("p2: ", population[p]);
        }

        // checkSwapEvery2PointsOfPopulation();
        console.log("Pathfinder > here we go...");
        do {
            console.log(" ===== STart try " + (tries + 1) + " of " + maxTries);
            // const pathfindingLoop = () => {
            const startIteration = performance.now();
            // const startCollision = foundRepeat;
            // const start1 = performance.now();
            // console.log("calcFitness...");
            calculateFitness();
            // console.log(performance.now() - start1);

            // const start2 = performance.now();
            // console.log("normalize...");
            normalizeFitness();
            // console.log(performance.now() - start2);

            // const start3 = performance.now();
            // console.log("nextGen...");
            nextGeneration();
            // console.log(performance.now() - start3);

            // const start4 = performance.now();
            // console.log('checkSwapAllPopulation...');
            checkSwapEvery2PointsOfPopulation();
            // console.log(performance.now() - start4);

            // console.log("tries: ", tries, "of ", maxTries);
            // console.log("unique orders: ", uniqueOrdersTried);
            // console.log("collisions: ", foundRepeat - startCollision);
            // const pctDone = (tries / maxTries) * 100;
            // setProgressPercent(pctDone);
            // console.log("PCT: ", pctDone);
            console.log(
                ` ----- try ${tries} of ${maxTries} took ${(
                    performance.now() - startIteration
                ).toLocaleString("en", "us")}`
            );
            // DR 9/1/22 - do/while replaced with requestAnimationFrame so that we can draw the loadbar with every frame
            //     if (tries < maxTries) {
            //         window.requestAnimationFrame(pathfindingLoop);
            //     }
            // };
            // window.requestAnimationFrame(pathfindingLoop);
            tries++;
        } while (tries < maxTries);

        console.log("-----------------------------");
        console.log("lookedForRepeat: ", lookedForRepeat);
        console.log("unique orders: ", uniqueOrdersTried);
        console.log("collisions: ", foundRepeat);
        console.log(uniqueOrdersTried + foundRepeat);
        console.log("SHORTEST DIST: ", shortestDist);
        console.log("Best Order: ", bestOrder);

        return reorderWaypoints(waypoints, bestOrder);
    };

    // function redrawGrid(keepPaths = false) {
    //     // Re-draws grid
    //     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //     for (const col of currentStore.grid) {
    //         for (const tile of col) {
    //             if(tile.obstacle)drawTile(tile);
    //             if (keepPaths && tile.endSegment) {
    //                 // drawSegment(tile.endSegment.fromTile, tile.endSegment.toTile);
    //             } else {
    //                 tile.endSegment = null;
    //             }
    //         }
    //     }
    // }

    // const drawDotAtTile = (tile,color="pink") => {
    //     ctx.fillStyle = color;
    //     const x = tile.col * tileSize+tileSize*0.5;
    //     const y = tile.row * tileSize+tileSize*0.5;
    //     const radius = tileSize*1.6;
    //     ctx.beginPath();
    //     ctx.arc(x, y, radius, 0, 2 * Math.PI);
    //     ctx.fill();
    // }

    // const drawTile = (tile) => {
    //     ctx.fillStyle = "#333";
    //     const x = tile.col * tileSize;
    //     const y = tile.row * tileSize;
    //     ctx.beginPath();
    //     ctx.rect(x, y, tileSize, tileSize);
    //     ctx.fill();
    // };

    // Math Functions

    function factorialize(num) {
        if (num < 0) return -1;
        else if (num === 0) return 1;
        else {
            return num * factorialize(num - 1);
        }
    }

    return {
        sayHello: function () {
            console.log("hello. It's ", secret);
        },

        getShoppingPath: function (shoppingList, theCurrentStore) {
            console.log("Pathfinding > getShoppingPath()");
            console.log("shoppingList: ", shoppingList);
            currentStore = theCurrentStore;
            entranceTile = currentStore.entranceTile;
            checkoutTile = currentStore.checkoutTile;
            // console.log("ENTRANCE TILE: ", entranceTile);
            // console.log("CHECKOUT TILE: ", checkoutTile);
            clearPaths();
            waypoints.length = 0;
            for (const item of shoppingList) {
                waypoints.push(getTileByIndices(item.col, item.row));
            }
            console.log(
                "Pathfinding > unordered WAYPOINTS: ",
                waypoints.length
            );
            console.log("Pathfinding > unordered WAYPOINTS: ", waypoints);

            // Get Shortest Path through Waypoints
            const orderedWPs = tspShortestByMutation(waypoints);

            console.log("orderedWPs: ", orderedWPs.length);
            console.log("orderedWPs: ", orderedWPs);
            for (let o = 0; o < orderedWPs.length - 1; o++) {
                const tileA = orderedWPs[o];
                const tileB = orderedWPs[o + 1];
                const path = findPathFromAtoB(tileA, tileB);
                paths.push(path);
            }
            console.log("Pathfinding > orderedWPs: ", orderedWPs);
            // Reorder shopping list
            const orderedItems = [];
            const itemWPs = orderedWPs.slice(1, -1);
            for (const tile of itemWPs) {
                orderedItems.push(
                    shoppingList.find(
                        (item) => item.col === tile.col && item.row === tile.row
                    )
                );
            }
            console.log("orderedItems: ", orderedItems);
            return { paths, orderedItems };
        },
    };
};

export default PathfindingFn;
