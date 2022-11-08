// Slowdeath
// A screeps AI
//

import { BuildingManager } from "./manager/BuildingManager";
import { WorkerManager } from "./manager/WorkerManager";
import { gitVersion } from "../utils/version";
import { logger } from "../utils/logger";



export class Slowdeath {
  public static buildingManager: BuildingManager;
  public static workerManager: WorkerManager;
  public static init(): void {
    Memory.version = gitVersion;
    if (Memory.count === undefined) {
      Memory.count = 0;
    }
    for (const roomName of Object.keys(Game.rooms)) {
      defendRoom(roomName);
      const room: Room = Game.rooms[roomName];
      logger.printObject(room);
      const roomControllerLevel: number = room.controller !== undefined ? room.controller.level : 0;
      if (roomControllerLevel === 0) {
        logger.warning("AI doesnt have capability to work with controller level 0 rooms");
      } else if (roomControllerLevel <= 5) {
        logger.info(`Room Level ${roomControllerLevel} ...starting to work`);
        this.roomManager = new RoomManager();

        this.buildingManager = new BuildingManager();
        this.workerManager = new WorkerManager();
        this.roomManager.init(room);
        this.buildingManager.init(room);
        this.workerManager.init(room);
      } else {
        logger.warning(
          "AI doesnt have capability to work with controller level: %{roomControllerLevel} rooms"
        );
      }
    }
  }

  public static execute(): void {
    this.buildingManager.run();
    this.workerManager.run();
  }
}
