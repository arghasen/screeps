import { Role } from "../../slowdeath/creepActions/constants";
import { logger } from "utils/logger";
import {
  getStructuresNeedingEnergy,
  getCreepNeedingEnergy,
  pickupDroppedEnergy,
  transfer
} from "./CommonActions";

export class Hauler {
  public static run = (creep: Creep): void => {
    if (creep.memory.running && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.running = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.running && creep.store.getFreeCapacity() === 0) {
      creep.memory.running = true;
      creep.say("🚧 running");
    }

    if (creep.memory.running) {
      const target = getStructuresNeedingEnergy(creep);
      const storage = creep.room.storage;
      if (target) {
        // TODO: check why this is not working with the func.
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        } // no target exist, then transfer energy to storage
      } else if (storage && storage.store.getCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, storage);
      } else {
        // no target exist, then transfer energy to creeps
        const targetCreep = getCreepNeedingEnergy(creep);
        logger.debug(`targetCreep:${logger.json(targetCreep)} for hauler: ${logger.json(creep)}`);
        if (targetCreep) {
          transfer(creep, targetCreep);
        }
      }
    } else {
      creep.memory.running = false;
      pickupDroppedEnergy(creep);
    }
  };
}
