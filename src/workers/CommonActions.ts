export function pickupDroppedEnergy(creep: Creep) {
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