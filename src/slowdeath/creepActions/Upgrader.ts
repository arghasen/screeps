import { harvest, pickupDroppedEnergy } from "./CommonActions";
import { logger } from "../../utils/logger";

export class Upgrader {
  public static run = (creep: Creep): void => {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    if (creep.memory.upgrading && creep.room.controller !== undefined) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    } else {
      const structures = creep.room.find(FIND_STRUCTURES);
      const stores = structures.filter(
        structure =>
          (structure.structureType === STRUCTURE_CONTAINER ||
            structure.structureType === STRUCTURE_STORAGE) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()
      );
      logger.info(`upgrader ${creep.name} energy stores:${stores}`);
      if (stores.length >= 1) {
        const store = creep.pos.findClosestByPath(stores);
        if (store) {
          if (creep.withdraw(store, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(store, { visualizePathStyle: { stroke: "#ffaa00" } });
            return;
          }
        }
      } else if (Memory.continuousHarvestingStarted) {
        pickupDroppedEnergy(creep);
      } else {
        const source = creep.pos.findClosestByPath(FIND_SOURCES);
        harvest(source, creep);
      }
    }
  };
}
