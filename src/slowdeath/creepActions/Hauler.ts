import {
  getStructuresNeedingEnergy,
  getStructuresNeedingResource,
  pickupDroppedEnergy,
  transfer,
  transferAnyResource,
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
    super.setRcl(creep);
    if (this.shouldHandleEnemySituation(creep)) {
      this.handleEnemySituation(creep);
    } else if (creep.memory.task === CreepTask.RENEW) {
      super.renewCreep(creep);
    } else if (creep.memory.task !== CreepTask.HARVEST) {
      this.handleResourceDistribution(creep);
    } else {
      this.handleEnergyCollection(creep);
    }
  };

  private static shouldHandleEnemySituation(creep: Creep): boolean {
    return !!(
      this.rcl >= 3 &&
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

  private static handleResourceDistribution(creep: Creep): void {
    const primaryResource = this.getPrimaryResource(creep);

    if (primaryResource === RESOURCE_ENERGY) {
      this.handleEnergyDistribution(creep);
    } else {
      this.handleNonEnergyDistribution(creep, primaryResource);
    }
  }

  private static getPrimaryResource(creep: Creep): ResourceConstant {
    const resourceTypes = Object.keys(creep.store) as ResourceConstant[];
    if (resourceTypes.length === 0) return RESOURCE_ENERGY;

    // Prioritize energy, then minerals, then other resources
    if (resourceTypes.includes(RESOURCE_ENERGY)) return RESOURCE_ENERGY;

    // const mineralTypes = [
    //   RESOURCE_HYDROGEN,
    //   RESOURCE_OXYGEN,
    //   RESOURCE_UTRIUM,
    //   RESOURCE_LEMERGIUM,
    //   RESOURCE_KEANIUM,
    //   RESOURCE_ZYNTHIUM,
    //   RESOURCE_CATALYST,
    //   RESOURCE_GHODIUM
    // ];

    // const mineralResource = resourceTypes.find(type =>
    //   mineralTypes.includes(type as ResourceConstant)
    // );
    // if (mineralResource) return mineralResource;

    return resourceTypes[0];
  }

  private static handleEnergyDistribution(creep: Creep): void {
    const target = getStructuresNeedingEnergy(creep);

    if (target) {
      transfer(creep, target);
    } else {
      this.distributeEnergyToStorage(creep);
    }
  }

  private static handleNonEnergyDistribution(creep: Creep, resourceType: ResourceConstant): void {
    const target = getStructuresNeedingResource(creep, resourceType);

    if (target) {
      transferAnyResource(creep, target);
    } else {
      this.distributeResourceToStorage(creep, resourceType);
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

  private static distributeResourceToStorage(creep: Creep, resourceType: ResourceConstant): void {
    const storage = creep.room.storage;
    const terminal = creep.room.terminal;

    // For non-energy resources, prioritize storage, then terminal
    if (this.rcl >= 4 && storage && storage.store.getFreeCapacity(resourceType) > 0) {
      transferAnyResource(creep, storage);
    } else if (this.rcl >= 6 && terminal && terminal.store.getFreeCapacity(resourceType) > 0) {
      transferAnyResource(creep, terminal);
    } else {
      // If no storage available, try to transfer to other creeps that need it
      this.transferResourceToCreeps(creep, resourceType);
    }
  }

  private static transferResourceToCreeps(creep: Creep, resourceType: ResourceConstant): void {
    // Find creeps that need this resource type
    const creepsNeedingResource = creep.room.find(FIND_MY_CREEPS, {
      filter: otherCreep =>
        otherCreep.id !== creep.id && otherCreep.store.getFreeCapacity(resourceType) > 0
    });

    if (creepsNeedingResource.length > 0) {
      const closestCreep = creep.pos.findClosestByRange(creepsNeedingResource);
      if (closestCreep) {
        transferAnyResource(creep, closestCreep);
      }
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
      } else {
        // Try to collect other resources from storage
        this.collectOtherResourcesFromStorage(creep);
      }
    }
  }

  private static collectOtherResourcesFromStorage(creep: Creep): void {
    const storage = creep.room.storage;
    if (!storage) return;

    // Find any resource type that storage has and creep can carry
    const resourceTypes = Object.keys(storage.store) as ResourceConstant[];
    for (const resourceType of resourceTypes) {
      if (
        storage.store.getUsedCapacity(resourceType) > 0 &&
        creep.store.getFreeCapacity(resourceType) > 0
      ) {
        withdraw(creep, storage);
        break;
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
