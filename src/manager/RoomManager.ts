import { Manager } from './Manager';

import { controllerConsts, maxRolePopulation, Role } from '../constants';

export class RoomManager extends Manager {
  public spawns: StructureSpawn[] = [];
  public myCreeps: Creep[] = [];
  public sources: Source[] = [];
  public init = (room: Room):void => {
    let gameSpawns = Game.spawns;
    for (let spawnName in gameSpawns) {
      if (gameSpawns[spawnName].room.name == room.name) {
        this.spawns.push(gameSpawns[spawnName]);
      }
    }

    // if(this.myCreeps.length < maxRolePopulation.total)
    // {
    //     var energyAvailable = room.energyAvailable
    //     this.createCreep(energyAvailable, Role.)
    // }
  };

  public run = () => {};
}
