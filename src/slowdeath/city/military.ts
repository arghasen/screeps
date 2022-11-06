import { Process } from "../../os/process";
import { logger } from "../../utils/logger";

export class Military extends Process {
  protected className = "military";
  private metadata?: CityData;
  private towers: AnyOwnedStructure[] = [];
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting military for ${this.metadata.roomName}`);
    const room = Game.rooms[this.metadata.roomName];
    this.towers = room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    });
    if (room.controller?.my && room.controller.level >= 3) {
      if (this.towers.length < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][room.controller.level]) {
        logger.info("time to build a tower");
        room.createConstructionSite(25, 25, STRUCTURE_TOWER);
      }
    }
    this.defendRoom(room);
  }

  private defendRoom(room: Room): void {
    const hostiles: Creep[] = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      Game.notify(`enemy spotted in room ${room.name}`);

      this.towers.forEach((tower: AnyOwnedStructure): void => {
        if (tower.structureType === STRUCTURE_TOWER) {
          tower.attack(hostiles[0]);
        }
      });
    }
  }
}
