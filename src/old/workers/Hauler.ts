import { logger } from 'utils/logger';
import { Role } from '../constants';
import { pickupDroppedEnergy } from './CommonActions';

export class Hauler {
  public static run = (creep: Creep): void => {
    if (creep.memory.running && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.running = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.running && creep.store.getFreeCapacity() === 0) {
      creep.memory.running = true;
      creep.say('🚧 running');
    }

    if (creep.memory.running) {
        const target = this.getStructuresNeedingEnergy(creep);
      if (target) {
        // TODO: check why this is not working with the func.
        if (creep.transfer(target, RESOURCE_ENERGY) ===ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        } // no target exist, then transfer energy to creeps
      } else {
        const targetCreep = creep.pos.findClosestByRange(FIND_CREEPS, {
          filter: (creepTo) =>
            creepTo.memory.role !== Role.ROLE_HAULER &&
            creepTo.store.getFreeCapacity() <  creepTo.store.getCapacity() *0.9
        });

        logger.debug(`targetCreep:${targetCreep} for hauler: ${creep}`);
        
        if (targetCreep) {
          this.transferEnergy(creep, targetCreep);
        } else {
            const storage = creep.room.storage;
          if (storage) {
            if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(storage, {
                visualizePathStyle: { stroke: '#ffffff' }
              });
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

  private static getStructuresNeedingEnergy(creep: Creep): AnyStructure|null {
    const structures = creep.room.find(FIND_STRUCTURES);
    const targets = _.filter(structures, (structure) => {
      return (
        (structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN ||
          structure.structureType === STRUCTURE_CONTAINER ||
          structure.structureType === STRUCTURE_TOWER) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    });
    logger.debug(creep.name + targets);
    const target = creep.pos.findClosestByPath(targets);
    logger.debug(`closestStructure:  ${target}`);
    return target;
  }

  private static transferEnergy(
    creep: Creep,
    target: AnyCreep | Structure
  ) {
    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}
