import { harvest, pickupDroppedEnergy, repair } from "./CommonActions";

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
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
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
            (structure.structureType === STRUCTURE_RAMPART && structure.hits < 500000)
        );
        const targetStructure: AnyStructure | null = creep.pos.findClosestByRange(targetStructures);
        if (targetStructure !== null) {
          repair(creep, targetStructure);
        }
      }
    } else {
      //   if (Memory.continuousHarvestingStarted) {
      //     pickupDroppedEnergy(creep);
      //   } else {
      const source = creep.pos.findClosestByPath(FIND_SOURCES);
      harvest(source, creep);
      // }
    }
  };
}
