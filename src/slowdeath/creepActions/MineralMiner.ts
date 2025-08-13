import { logger } from "utils/logger";
import { CreepTask } from "./constants";
import { harvest } from "./CommonActions";
import { Actor } from "./Actor";

export class MineralMiner extends Actor {
  public static run = (creep: Creep): void => {
    const source = creep.pos.findClosestByRange(FIND_MINERALS);
    if (source) {
      if (creep.memory.task === CreepTask.RENEW) {
        super.renewCreep(creep);
      } else if (creep.ticksToLive && creep.ticksToLive > 250) {
        if (creep.store.getFreeCapacity() > 0) {
          harvest(creep, source);
        } else {
          storeMinerals(creep);
        }
      } else if (creep.store.getUsedCapacity() > 0) {
        storeMinerals(creep);
      } else {
        creep.memory.task = CreepTask.RENEW;
      }
    } else {
      logger.info(`Mineral miner ${creep.name} has no source`);
    }
  };
}

// ... existing code ...
function storeMinerals(creep: Creep) {
  const structures = creep.room.find(FIND_STRUCTURES);
  const storage = structures.find(
    structure => structure.structureType === STRUCTURE_STORAGE
  ) as StructureStorage;
  const terminal = structures.find(
    structure => structure.structureType === STRUCTURE_TERMINAL
  ) as StructureTerminal;

  if (storage) {
    if (creep.pos.inRangeTo(storage, 1)) {
      if (storage.store.getFreeCapacity() > 0) {
        // Storage has space, transfer to storage
        for (const resourceType of Object.keys(creep.store)) {
          if (creep.store.getUsedCapacity(resourceType as ResourceConstant) > 0) {
            creep.transfer(storage, resourceType as ResourceConstant);
          }
        }
      } else if (
        terminal &&
        terminal.store.getFreeCapacity() > 0 &&
        creep.pos.inRangeTo(terminal, 1)
      ) {
        // Storage is full, transfer to terminal if it has space
        for (const resourceType of Object.keys(creep.store)) {
          if (creep.store.getUsedCapacity(resourceType as ResourceConstant) > 0) {
            creep.transfer(terminal, resourceType as ResourceConstant);
          }
        }
      }
    } else {
      // Move to storage first, then terminal if storage is full
      const target = storage.store.getFreeCapacity() > 0 ? storage : terminal;
      if (target) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }
}
// ... existing code ...
