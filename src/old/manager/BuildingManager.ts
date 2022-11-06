import { Manager } from "./Manager";
import { controllerConsts, directionsArray, extensionLoc } from "../../slowdeath/creepActions/constants";

export class BuildingManager extends Manager {
  spawns: StructureSpawn[] = [];

  extensionsUnderConstruction: ConstructionSite[] = [];
  extensionsCreated: AnyOwnedStructure[] = [];

  init = (room: Room) => {
    const gameSpawns = Game.spawns;
    for (const spawnName of Object.keys(gameSpawns)) {
      if (gameSpawns[spawnName].room.name === room.name) {
        this.spawns.push(gameSpawns[spawnName]);
      }
    }

    if (room.controller?.level === 2) {
      if (this.extensionsCreated.length !== controllerConsts.lvl2extensions) {
        Memory.focus = "build";
      } else {
        Memory.focus = "upgrade";
      }
      if (this.getTotalExtensions() < controllerConsts.lvl2extensions) {
        this.createExtensions(room);
      } else if (!Memory.roadsDone) {

        Memory.roadsDone = true;
        this.setupMineContainers(room);
      }
    }
  };

  run = () => {};

  private setupMineContainers(room: Room) {
    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
      const possibleMiningLocations = [];
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
}
