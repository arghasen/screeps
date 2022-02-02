import { directionsArray } from "../constants";

function nearbyTerrain(room: Room) {
    var sources = room.find(FIND_SOURCES);
    for (const source of sources) {
        var possibleFreeLocations = [];
        for (const loc of directionsArray) {
            var x = source.pos.x + loc[0];
            var y = source.pos.y + loc[1];
            const terrain = room.getTerrain().get(x, y);
            console.log("Terrain at: (" + x + "," + y + "):" + terrain);
            if (terrain != TERRAIN_MASK_WALL) {
                possibleFreeLocations.push(loc);
            }
            console.log("Possible Free Locations:", possibleFreeLocations);
            // const closestSource = PathFinder.search(this.spawns[0].pos, possibleMiningLocations);
            // console.log("closest path to source")
        }
    }
}