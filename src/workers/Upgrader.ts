import {pickupDroppedEnergy} from './CommonActions'
export class Upgrader {
  static run = (creep: Creep) => {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading && creep.room.controller) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: '#ffffff' }
        });
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
