import { directionsArray } from "slowdeath/creepActions/constants";

export function color(str: string | number, colorName: string): string {
  return `<span style="color: ${colorName};">${str}</span>`;
}

export function printRoomName(roomName: string): string {
  return `<a href="#!/room/' ${Game.shard.name} / ${roomName}> ${roomName} </a>`;
}

export function onPublicServer(): boolean {
  return Game.shard.name.includes("shard");
}

function setupMineContainers(room: Room) {
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const possibleMiningLocations: number[][] = [];
    for (const loc of directionsArray) {
      const x = source.pos.x + loc[0];
      const y = source.pos.y + loc[1];
      const terrain = room.getTerrain().get(x, y);
      console.log(`Terrain at: (${x},${y}):${terrain}`);
      if (terrain !== TERRAIN_MASK_WALL) {
        possibleMiningLocations.push(loc);
      }
      console.log("Possible Mining Locations:", possibleMiningLocations);
    }
  }
}

export function nearbyTerrain(room: Room): void {
  const sources: Source[] = room.find(FIND_SOURCES);
  for (const source of sources) {
    const possibleFreeLocations: number[][] = [];
    for (const loc of directionsArray) {
      const x: number = source.pos.x + loc[0];
      const y: number = source.pos.y + loc[1];
      const terrain: 0 | 1 | 2 = room.getTerrain().get(x, y);
      console.log(`Terrain at: (${x},${y}):${terrain}`);
      if (terrain !== TERRAIN_MASK_WALL) {
        possibleFreeLocations.push(loc);
      }
      console.log("Possible Free Locations:", possibleFreeLocations);
    }
  }
}
