import { harvest, pickupDroppedEnergy } from './CommonActions';

export class Harvester {
  public static run = (creep: Creep):void => {
    if (creep.store.getFreeCapacity() > 0) {
      if (Memory.continuousHarvestingStarted) {
        pickupDroppedEnergy(creep);
      } else {
        const source = creep.pos.findClosestByPath(FIND_SOURCES);
        harvest( source, creep);
      }
    } else {
        const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType === STRUCTURE_EXTENSION ||
              structure.structureType === STRUCTURE_SPAWN) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      });
      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: { stroke: '#ffffff' }
          });
        }
      }
    }
  };
}
