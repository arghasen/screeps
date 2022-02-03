// Slowdeath
// A screeps AI
//

import { RoomManager } from './manager/RoomManager';
import { BuildingManager } from './manager/BuildingManager';
import { WorkerManager } from './manager/WorkerManager';
import { git_version } from './utils/version'

function defendRoom(roomName:string) {
    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        //var username = hostiles[0].owner.username;
        Game.notify(`enemy spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.structureType ==STRUCTURE_TOWER? tower.attack(hostiles[0]):_.noop);
    }
}

export class Slowdeath {
  static roomManager_: RoomManager;
  static buildingManager_: BuildingManager;
  static workerManager_: WorkerManager;
  static init() {
    Memory.version = git_version;
    var rooms = Game.rooms;
    for (var roomName in rooms) {
        defendRoom(roomName)
      var room = rooms[roomName];
      console.log(JSON.stringify(room));
      var roomControllerLevel = room.controller ? room.controller.level : 0;
      if (roomControllerLevel == 0) {
        console.log(
          'AI doesnt have capability to work with controller level 0 rooms'
        );
      } else if (roomControllerLevel <= 4) {
        console.log(
          'Room Level ' + roomControllerLevel + '...starting to work'
        );
        this.roomManager_ = new RoomManager();

        this.buildingManager_ = new BuildingManager();
        this.workerManager_ = new WorkerManager();
        this.roomManager_.init(room);
        this.buildingManager_.init(room);
        this.workerManager_.init(room);
      } else {
        console.log(
          'AI doesnt have capability to work with controller level 0 rooms'
        );
      }
    }
  }

  static run() {
    this.roomManager_.run();
    this.buildingManager_.run();
    this.workerManager_.run();
  }
}
