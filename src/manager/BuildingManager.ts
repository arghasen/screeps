import { Manager } from './Manager';
import { controllerConsts, extensionLoc } from '../constants';

export class BuildingManager extends Manager {
  spawns: StructureSpawn[] = [];

  extensionsUnderConstruction: ConstructionSite[] = [];
  extensionsCreated: AnyOwnedStructure[] = [];

  init = (room: Room) => {
    var gameSpawns = Game.spawns;
    for (var spawnName in gameSpawns) {
      if (gameSpawns[spawnName].room.name == room.name) {
        this.spawns.push(gameSpawns[spawnName]);
      }
    }

    var myStructures = room.find(FIND_MY_STRUCTURES);
    this.extensionsCreated = myStructures.filter(
      (structure) => structure.structureType == STRUCTURE_EXTENSION
    );

    var constructionSites = room.find(FIND_CONSTRUCTION_SITES);
    this.extensionsUnderConstruction = constructionSites.filter(
      (site) => site.structureType == STRUCTURE_EXTENSION
    );

    if (room.controller?.level == 2) {
      if (this.getTotalExtensions() < controllerConsts.lvl2extensions) {
        this.createExtensions(room);
      }
      else
      {
          // TODO: Add Containers
      }
    }
  };

  run = () => {};

  private getTotalExtensions() {
    return (
      this.extensionsUnderConstruction.length + this.extensionsCreated.length
    );
  }

  private createExtensions(room: Room) {
    var loc = _.cloneDeep(extensionLoc[2]);
    for (
      var i = this.getTotalExtensions();
      i < controllerConsts.lvl2extensions;
      i++
    ) {
      console.log(loc);
      var res = room.createConstructionSite(
        this.spawns[0].pos.x + loc[i][0],
        this.spawns[0].pos.y + loc[i][1],
        STRUCTURE_EXTENSION
      );
      console.log('result for creation', res);
      if (res != 0) {
        loc.splice(i, 1);
        --i;
      }
    }
  }
}
