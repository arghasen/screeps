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
    if (this.towers.length === 0) {
      logger.debug(`${this.className}: No towers found in room ${room.name}`);
      return;
    }

    const repairTower = this.towers.reduce((highest, tower) => {
      const towerEnergy = tower.store[RESOURCE_ENERGY];
      const highestEnergy = highest.store[RESOURCE_ENERGY];
      const towerCapacity = tower.store.getCapacity(RESOURCE_ENERGY);
      const highestCapacity = highest.store.getCapacity(RESOURCE_ENERGY);

      // Prefer towers with higher energy percentage of their capacity
      const towerPercentage = towerEnergy / towerCapacity;
      const highestPercentage = highestEnergy / highestCapacity;

      return towerPercentage > highestPercentage ? tower : highest;
    }, this.towers[0]);

    logger.debug(`${this.className}: Selected tower ${repairTower.id} with ${repairTower.store[RESOURCE_ENERGY]}/${repairTower.store.getCapacity(RESOURCE_ENERGY)} energy`);

    const targetStructure = findStructureNeedingRepair(room, repairTower.pos, 'tower');
    if (targetStructure) {
      repairTower.repair(targetStructure);
      logger.debug(`${this.className}: Repairing structure ${targetStructure.id} at ${targetStructure.pos}`);
    }
  }

  private defendRoom(room: Room): boolean {
    const hostiles: Creep[] = room.find(FIND_HOSTILE_CREEPS);
    const hasHostiles = hostiles.length > 0;
    if (hasHostiles) {
      room.memory.enemy = true;
      Game.notify(`enemy spotted in room ${room.name}`);
      this.attackHostiles(hostiles);
    } else {
      room.memory.enemy = false;
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
