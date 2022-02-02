export class Hauler {
  private static getStructuresNeedingEnergy(creep: Creep) {
    var structures = creep.room.find(FIND_STRUCTURES);
    var targets = _.filter(structures, (structure) => {
      return (
        (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    });
    console.log(creep.name + targets);
    var target = creep.pos.findClosestByPath(targets);
    console.log(target);
    return target;
  }

  private static pickup(
    creep: Creep,
    closestSource: Resource<ResourceConstant>
  ) {
    if (creep.pickup(closestSource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(closestSource, {
        visualizePathStyle: { stroke: '#ffaa00' }
      });
    }
  }

  private static pickupDroppedEnergy(creep: Creep) {
    var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
    var energyResources = _.filter(
      droppedResources,
      (droppedResource) => droppedResource.resourceType == RESOURCE_ENERGY
      // storeTargetInCreepMemory&&
      // droppedResource.amount >= creep.store.getFreeCapacity()
    );
    if (energyResources) {
      var closestSource = creep.pos.findClosestByPath(energyResources);
      console.log(creep.name + closestSource);

      if (closestSource) {
        if (closestSource instanceof Resource) {
          this.pickup(creep, closestSource);
        }
      }
    } else {
      // var structures = creep.room.find(FIND_STRUCTURES);
      // var containers = _.filter(
      //     structures,
      //     (structure) =>
      //       structure.structureType == STRUCTURE_CONTAINER &&
      //       structure.store.getUsedCapacity() >= creep.store.getFreeCapacity()
      //   );
      //   var closestSource = creep.pos.findClosestByPath(containers);
    }
  }
  
  private static transferEnergy(creep: Creep, target: AnyStructure) {
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
        this.transferEnergy(creep, target);
      } // no target exist, then transfer energy to stores
      else {
        //   var target = getStorgesWithFreeCapacity(creep, target);
        //   if (target) {
        //     this.transferEnergy(creep, target);
        //   } else {
        creep.memory.running = false;
        //}
      }
    } else {
      this.pickupDroppedEnergy(creep);
    }
  };
}
