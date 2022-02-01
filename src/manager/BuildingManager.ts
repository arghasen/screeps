import { Manager } from './Manager';
import {controllerConsts} from "../constants"

export class BuildingManager extends Manager {
    spawns: StructureSpawn[] = [];

    extensionsUnderConstruction:ConstructionSite[] =[];
    init = (room: Room) => {
    var gameSpawns = Game.spawns;
    for (var spawnName in gameSpawns) {
      if (gameSpawns[spawnName].room.name == room.name) {
        this.spawns.push(gameSpawns[spawnName]);
      }
    }

    var constructionSites = room.find(FIND_CONSTRUCTION_SITES);
    this.extensionsUnderConstruction = constructionSites.filter((site)=> site.structureType== STRUCTURE_EXTENSION)
    if (room.controller?.level == 2) {
      for (var i = this.extensionsUnderConstruction.length; i < controllerConsts.lvl2extensions; i++) {
        var res = room.createConstructionSite(
          this.spawns[0].pos.x + i,
          this.spawns[0].pos.y + i,
          STRUCTURE_EXTENSION
        );
        console.log('result for creation', res);
        //if(res)
      }
    }
    };

  run = () => {};
}
