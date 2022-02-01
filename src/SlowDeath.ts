// Slowdeath
// A screeps AI
//

import { RoomManager } from 'manager/RoomManager';
import { BuildingManager } from 'manager/BuildingManager';
import { WorkerManager } from 'manager/WorkerManager';

export class Slowdeath {
  static roomManager_: RoomManager;
  static buildingManager_: BuildingManager;
  static workerManager_: WorkerManager;
  static init() {
    var rooms = Game.rooms;
    for (var roomName in rooms) {
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
