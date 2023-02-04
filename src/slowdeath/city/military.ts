import { Role } from "slowdeath/creepActions/constants";
import { Dismantler } from "slowdeath/creepActions/Dismantler";
import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import { findStructureNeedingRepair } from "../creepActions/CommonActions"

export class Military extends Process {
  protected className = "military";
  private metadata?: CityData;
  private towers: StructureTower[] = [];
  private defendedRoomThisTick: boolean = false;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting military for ${this.metadata.roomName}`);
    const room = Game.rooms[this.metadata.roomName];
    this.towers = room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    });
    
    this.defendRoom(room);
    if (!this.defendedRoomThisTick) {
      this.repairRoom(room);
    }
  }

  private repairRoom(room: Room): void {
    const repairTower = this.towers[0];
    if (repairTower) {
      const targetStructure = findStructureNeedingRepair(room, repairTower.pos);
      if (targetStructure) {
        repairTower.repair(targetStructure);
      }
    }
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
      this.defendedRoomThisTick = true;
    }
  }
}
