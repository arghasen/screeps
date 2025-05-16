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
  public static run = (creep: Creep): void => {
    super.setTask(creep);
    if (
      creep.room.memory.enemy &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity(RESOURCE_ENERGY) * 0.5
    ) {
      const tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_TOWER
      });
      logger.warning(`${creep.name} found tower ${logger.json(tower)}`);
      if (tower) {
        creep.say("Enemy, energy to tower");
        if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
          creep.moveTo(tower, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    } else if (creep.memory.task === CreepTask.RENEW) {
      super.renewCreep(creep);
    } else if (creep.memory.task !== CreepTask.HARVEST) {
      const target = getStructuresNeedingEnergy(creep);
      const storage = creep.room.storage;
      const terminal = creep.room.terminal;
      if (target) {
        // TODO: check why this is not working with the func.
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      } else {
        // no target exist, then transfer energy to creeps
        if (useUpEnergy(creep.room) || !storage) {
          transferEnergyFromCreep(creep);
        } else if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          transfer(creep, storage);
        } else if (terminal && terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          transfer(creep, terminal);
        }
      }
    } else {
      if (!pickupDroppedEnergy(creep)) {
        const containers: StructureContainer[] = creep.room.find(FIND_STRUCTURES, {
          filter: structure =>
            structure.structureType === STRUCTURE_CONTAINER &&
            structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        });
        const sortedContainers = containers.sort(
          (a, b) =>
            b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY)
        );
        if (sortedContainers.length > 0) {
          withdraw(creep, sortedContainers[0]);
        } else if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
          withdraw(creep, creep.room.storage);
        }
      }
    }
  };
}
