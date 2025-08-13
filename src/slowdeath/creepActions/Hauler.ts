import {
  getStructuresNeedingEnergy,
  pickupDroppedEnergy,
  transfer,
  transferEnergyFromCreep,
  useUpEnergy,
  withdraw
} from "./CommonActions";
import { CreepTask } from "./constants";
import { Actor } from "./Actor";
import { logger } from "utils/logger";

export class Hauler extends Actor {
  private static readonly ENEMY_ENERGY_THRESHOLD = 0.5;

  public static run = (creep: Creep): void => {
    super.setTask(creep);

    if (this.shouldHandleEnemySituation(creep)) {
      this.handleEnemySituation(creep);
    } else if (creep.memory.task === CreepTask.RENEW) {
      super.renewCreep(creep);
    } else if (creep.memory.task !== CreepTask.HARVEST) {
      this.handleEnergyDistribution(creep);
    } else {
      this.handleEnergyCollection(creep);
    }
  };

  private static shouldHandleEnemySituation(creep: Creep): boolean {
    return (
      creep.room.memory.enemy &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) >
        creep.store.getCapacity(RESOURCE_ENERGY) * this.ENEMY_ENERGY_THRESHOLD
    );
  }

  private static handleEnemySituation(creep: Creep): void {
    const tower = this.findClosestTower(creep);
    if (tower) {
      logger.warning(`${creep.name} found tower ${logger.json(tower)}`);
      creep.say("Enemy, energy to tower");
      transfer(creep, tower);
    }
  }

  private static findClosestTower(creep: Creep): StructureTower | null {
    const foundStructure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_TOWER
    });
    return foundStructure?.structureType === STRUCTURE_TOWER ? foundStructure : null;
  }

  private static handleEnergyDistribution(creep: Creep): void {
    const target = getStructuresNeedingEnergy(creep);

    if (target) {
      transfer(creep, target);
    } else {
      this.distributeEnergyToStorage(creep);
    }
  }

  private static distributeEnergyToStorage(creep: Creep): void {
    const storage = creep.room.storage;
    const terminal = creep.room.terminal;

    if (useUpEnergy(creep.room) || !storage) {
      transferEnergyFromCreep(creep);
    } else if (this.canStoreEnergy(storage)) {
      transfer(creep, storage);
    } else if (terminal && this.canStoreEnergy(terminal)) {
      transfer(creep, terminal);
    }
  }

  private static canStoreEnergy(
    structure: StructureStorage | StructureTerminal | undefined
  ): boolean {
    return !!(structure && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
  }

  private static handleEnergyCollection(creep: Creep): void {
    if (!pickupDroppedEnergy(creep)) {
      this.collectFromContainers(creep);
    }
  }

  private static collectFromContainers(creep: Creep): void {
    const containers = this.findEnergyContainers(creep);
    const storage = creep.room.storage;
    if (containers.length > 0) {
      const bestContainer = this.getBestContainer(containers);
      withdraw(creep, bestContainer);
    } else {
      if (storage && storage.store[RESOURCE_ENERGY] > 0) {
        withdraw(creep, storage);
      }
    }
  }

  private static findEnergyContainers(creep: Creep): StructureContainer[] {
    const structures = creep.room.find(FIND_STRUCTURES, {
      filter: structure =>
        structure.structureType === STRUCTURE_CONTAINER &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
    return structures.filter(
      (structure): structure is StructureContainer =>
        structure.structureType === STRUCTURE_CONTAINER
    );
  }

  private static getBestContainer(containers: StructureContainer[]): StructureContainer {
    return containers.sort(
      (a, b) => b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
    )[0];
  }
}
