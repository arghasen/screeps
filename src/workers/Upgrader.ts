import { pickupDroppedEnergy } from './CommonActions';
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
      var structures = creep.room.find(FIND_STRUCTURES);
      var stores = structures.filter(
        (structure) =>
          (structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_STORAGE ) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY)> creep.store.getCapacity()
      );
      console.log("upgrader",creep.name, "energy stores:" ,stores);
      if (stores.length>=1) {
        var store = creep.pos.findClosestByPath(stores);
        if (store) {
          if (creep.withdraw(store, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(store, { visualizePathStyle: { stroke: '#ffaa00' } });
            return;
        }
        }
      } 
       else if (Memory.continuousHarvestingStarted) {
          pickupDroppedEnergy(creep);
        } else {
          var source = creep.pos.findClosestByPath(FIND_SOURCES);
          if (source) {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
              creep.moveTo(source, {
                visualizePathStyle: { stroke: '#ffaa00' }
              });
            }
          }
        }
      
    }
  };
}
