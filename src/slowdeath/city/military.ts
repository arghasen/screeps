import { Role } from "slowdeath/creepActions/constants";
import { Dismantler } from "slowdeath/creepActions/Dismantler";
import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import { findStructureNeedingRepair } from "../creepActions/CommonActions";

export class Military extends Process {
  protected className = "military";
  private metadata?: CityData;
  private towers: StructureTower[] = [];
  public main() {
    this.metadata = this.data as CityData;
    logger.debug(`${this.className}: Starting military for ${this.metadata.roomName}`);
    const room = Game.rooms[this.metadata.roomName];
    this.towers = this.findTowers(room);
    if (!this.defendRoom(room)) {
      this.repairRoom(room);
    }
  }

  private findTowers(room: Room): StructureTower[] {
    return room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    });
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

  private defendRoom(room: Room): boolean {
    const hostiles: Creep[] = room.find(FIND_HOSTILE_CREEPS);
    const hasHostiles = hostiles.length > 0;
    if (hasHostiles) {
      Game.notify(`enemy spotted in room ${room.name}`);
      this.attackHostiles(hostiles);
    }
    return hasHostiles;
  }
  private attackHostiles(hostiles: Creep[]): void {
    this.towers.forEach((tower: AnyOwnedStructure): void => {
      if (tower.structureType === STRUCTURE_TOWER) {
        tower.attack(hostiles[0]);
      }
    });
  }
}
