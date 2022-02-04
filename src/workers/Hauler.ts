import { pickupDroppedEnergy } from './CommonActions';
import { Role } from '../constants';

export class Hauler {
  private static getStructuresNeedingEnergy(creep: Creep) {
    var structures = creep.room.find(FIND_STRUCTURES);
    var targets = _.filter(structures, (structure) => {
      return (
        (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_TOWER) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    });
    console.log(creep.name + targets);
    var target = creep.pos.findClosestByPath(targets);
    console.log('closestStructure:' + target);
    return target;
  }

  private static transferEnergy(
    creep: Creep,
    target: AnyCreep | Structure<StructureConstant>
  ) {
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }

  static run = (creep: Creep) => {
    if (creep.memory.running && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.running = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.running && creep.store.getFreeCapacity() == 0) {
      creep.memory.running = true;
      creep.say('🚧 running');
    }

    if (creep.memory.running) {
      var target = this.getStructuresNeedingEnergy(creep);
      if (target) {
        // TODO: check why this is not working with the func.
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        } // no target exist, then transfer energy to creeps
      } else {
        var targetCreep = creep.pos.findClosestByRange(FIND_CREEPS, {
          filter: (creepTo) =>
            creepTo.memory.role != Role.ROLE_HAULER &&
            creepTo.store.getFreeCapacity() < 0.9*creepTo.store.getCapacity()
        });
        console.log('targetCreep:' + targetCreep);
        if (targetCreep) {
          this.transferEnergy(creep, targetCreep);
        } else {
            var storage = creep.room.storage;
            if(storage){
                if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffffff' } });
                  }
            }
          creep.memory.running = false;
        }
      }
    } else {
      creep.memory.running = false;
      pickupDroppedEnergy(creep);
    }
  };
}
