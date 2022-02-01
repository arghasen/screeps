import { Manager } from './Manager';

import { controllerConsts, maxRolePopulation, Role } from '../constants';

export class RoomManager extends Manager {
  spawns: StructureSpawn[] = [];
  myCreeps: Creep[] = [];
  sources: Source[] = [];
  init = (room: Room) => {
    var gameSpawns = Game.spawns;
    for (var spawnName in gameSpawns) {
      if (gameSpawns[spawnName].room.name == room.name) {
        this.spawns.push(gameSpawns[spawnName]);
      }
    }

    // if(this.myCreeps.length < maxRolePopulation.total)
    // {
    //     var energyAvailable = room.energyAvailable
    //     this.createCreep(energyAvailable, Role.)
    // }
    if (room.controller?.level == 2) {
      for (var i = 0; i < controllerConsts.lvl2extensions; i++) {
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
