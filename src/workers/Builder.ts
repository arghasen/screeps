import { harvest, pickupDroppedEnergy, repair } from './CommonActions';

export class Builder {
  public static run = (creep: Creep):void => {
    // if (creep.room.name !== 'W29N19') {
    //     var target = new RoomPosition(12, 33, 'W29N19');
    //     const ret = creep.moveTo(target, {
    //       visualizePathStyle: { stroke: '#90ffff' }
    //     });
    //     console.log("REM Builder",ret);
    //     return;
    //   }
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
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
      } else {
        var myStructures = creep.room.find(FIND_STRUCTURES);
        var targetStructures = myStructures.filter(
          (structure) =>
            (structure.hits < structure.hitsMax &&
              structure.structureType !== STRUCTURE_WALL &&
              structure.structureType !== STRUCTURE_RAMPART) ||
            (structure.structureType === STRUCTURE_RAMPART &&
              structure.hits < 500000)
        );
        const targetStructure:AnyStructure|null = creep.pos.findClosestByRange(targetStructures);
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
      //}
    }
  };
}


