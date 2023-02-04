import { directionsArray } from "../slowdeath/creepActions/constants";

export function nearbyTerrain(room: Room): void {
  const sources: Source[] = room.find(FIND_SOURCES);
  for (const source of sources) {
    const possibleFreeLocations: number[][] = [];
    for (const loc of directionsArray) {
      const x: number = source.pos.x + loc[0];
      const y: number = source.pos.y + loc[1];
      const terrain: 0 | 1 | 2 = room.getTerrain().get(x, y);
      console.log("Terrain at: (" + x + "," + y + "):" + terrain);
      if (terrain !== TERRAIN_MASK_WALL) {
        possibleFreeLocations.push(loc);
      }
      console.log("Possible Free Locations:", possibleFreeLocations);
      // const closestSource = PathFinder.search(this.spawns[0].pos, possibleMiningLocations);
      // console.log("closest path to source")
    }
  }
}

function setupMineContainers(room: Room) {
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const possibleMiningLocations:number[][] = [];
    for (const loc of directionsArray) {
      const x = source.pos.x + loc[0];
      const y = source.pos.y + loc[1];
      const terrain = room.getTerrain().get(x, y);
      console.log("Terrain at: (" + x + "," + y + "):" + terrain);
      if (terrain !== TERRAIN_MASK_WALL) {
        possibleMiningLocations.push(loc);
      }
      console.log("Possible Mining Locations:", possibleMiningLocations);
      // const closestSource = PathFinder.search(this.spawns[0].pos, possibleMiningLocations);
      // console.log("closest path to source")
    }
  }
}