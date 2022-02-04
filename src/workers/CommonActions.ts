export function pickup(creep:Creep, closestSource:Resource) {
    if (creep.pickup(closestSource) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestSource, {
            visualizePathStyle: { stroke: "#ffaa00" },
        });
    }
}
export function pickupDroppedEnergy(creep: Creep) {
    const droppedResources  = creep.room.find(FIND_DROPPED_RESOURCES);
    const energyResources = _.filter(
      droppedResources,
      (droppedResource) => droppedResource.resourceType == RESOURCE_ENERGY
      // storeTargetInCreepMemory&&
      // droppedResource.amount >= creep.store.getFreeCapacity()
    );
    if (energyResources.length >=1) {
    if(energyResources.length ===1)
    {
     energyResources.sort((a,b)=>a.amount-b.amount);
    }
      let closestSource = undefined;
      if(energyResources[0].amount>2000)
      {
          closestSource = energyResources[0];
      }
      else
      {
          closestSource = creep.pos.findClosestByPath(energyResources);
      }
      console.log(`${creep.name}  ${closestSource}`);

      if (closestSource) {
        if (closestSource instanceof Resource) {
          pickup(creep, closestSource);
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
  export function harvest(source: Source | null, creep: Creep) {
    if (source) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
                visualizePathStyle: { stroke: '#ffaa00' }
            });
        }
    }
}

export function repair(creep: Creep, targetStructure: AnyStructure) {
    if (creep.repair(targetStructure) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targetStructure, {
            visualizePathStyle: { stroke: '#ffaa00' }
        });
    }
}