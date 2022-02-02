import { pickupDroppedEnergy } from "./CommonActions";

export class Builder {
  static run = (creep: Creep) => {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: { stroke: '#ffffff' }
          });
        }
      }
    } else {
        if(Memory.continuousHarvestingStarted)
        {
            pickupDroppedEnergy(creep);
        }
        else
        {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source) {
              if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                _.keys(creep);
              }
            }
        }

    }
  };
}
