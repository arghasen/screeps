// Slowdeath
// A screeps AI
//

import { BuildingManager } from "./manager/BuildingManager";
import { RoomManager } from "./manager/RoomManager";
import { WorkerManager } from "./manager/WorkerManager";
import { logger } from "../utils/logger";
import { gitVersion } from "../utils/version";

function defendRoom(roomName: string): void {
  const hostiles: Creep[] = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
  if (hostiles.length > 0) {
    Game.notify(`enemy spotted in room ${roomName}`);
    const towers: AnyOwnedStructure[] = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    });
    towers.forEach((tower: AnyOwnedStructure): void => {
      tower.structureType === STRUCTURE_TOWER ? tower.attack(hostiles[0]) : _.noop();
    });
  }
}

export class Slowdeath {
  public static roomManager: RoomManager;
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
  public static plan(): void {}

  public static execute(): void {
    this.roomManager.run();
    this.buildingManager.run();
    this.workerManager.run();
  }

  public static review(): void {}
}
