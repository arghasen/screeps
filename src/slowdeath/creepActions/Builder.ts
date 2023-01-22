import { getEnergy, repair } from "../../slowdeath/creepActions/CommonActions";
import { logger } from "utils/logger";

export class Builder {
  public static run = (creep: Creep): void => {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    if (creep.memory.building) {
      if (creep.memory.moveLoc) {
        const target = new RoomPosition(creep.memory.moveLoc.x, creep.memory.moveLoc.y, creep.memory.moveLoc.roomName);
        logger.info("Moving.location", logger.json(target));
        creep.moveTo(target);

        if (creep.memory.moveLoc.roomName === creep.pos.roomName) {
          delete creep.memory.moveLoc;
        }
      } else {
        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
          if (creep.build(targets[0]) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
            creep.moveTo(targets[0], {
              visualizePathStyle: { stroke: "#ffffff" }
            });
          }
        } else {
          const myStructures = creep.room.find(FIND_STRUCTURES);
          const targetStructures = myStructures.filter(
            structure =>
              (structure.hits < structure.hitsMax &&
                structure.structureType !== STRUCTURE_WALL &&
                structure.structureType !== STRUCTURE_RAMPART) ||
              (structure.structureType === STRUCTURE_RAMPART && structure.hits < 15000)
          );
          const targetStructure: AnyStructure | null =
            creep.pos.findClosestByRange(targetStructures);
          if (targetStructure !== null) {
            repair(creep, targetStructure);
          } else {
            const t = creep.pos.findClosestByRange(FIND_CREEPS);
            if (t) {
              creep.transfer(t, RESOURCE_ENERGY, creep.store.energy);
            }
          }
        }
      }
    } else {
      getEnergy(creep);
    }
  };
}
