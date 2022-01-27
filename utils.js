/** @param {Creep}  creep **/
function getClosestEnergySource(creep) {
  var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
  var structures = creep.room.find(FIND_STRUCTURES);
  console.log(structures);
  var energyResources = _.filter(
    droppedResources,
    (droppedResource) =>
      droppedResource.resourceType == RESOURCE_ENERGY &&
      droppedResource.amount >= creep.store.getFreeCapacity()
  );
  var containers = _.filter(
    structures,
    (structure) =>
      structure.structureType == STRUCTURE_CONTAINER &&
      structure.store.getUsedCapacity() >= creep.store.getFreeCapacity()
  );
  var allEnergy = droppedResources.concat(containers);
  console.log(allEnergy);
  var closestSource = creep.pos.findClosestByPath(allEnergy);
  console.log(creep.name + closestSource);
  return closestSource;
}

var utils = {
  /** @param {Creep}  creep **/
  harvestEnergy: function (creep) {
    var sources = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
      var res = creep.moveTo(sources[creep.memory.source], {
        visualizePathStyle: { stroke: "#ffaa00" },
      });
      if (res == ERR_NO_PATH) {
        creep.move(_.random(1, 8)); // FIXME: move in a random direction if no path found
      }
    }
  },
  /** @param {Creep}  creep **/
  pickupEnergy: function (creep) {
    var closestSource = getClosestEnergySource(creep);

    if (closestSource) {
      if (closestSource instanceof Resource) {
        if (creep.pickup(closestSource) == ERR_NOT_IN_RANGE) {
          var res = creep.moveTo(closestSource, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      } else if (closestSource instanceof Structure) {
        if (
          creep.withdraw(closestSource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
        ) {
          var res = creep.moveTo(closestSource, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      }
    }
  },

  pickupDroppedEnergy: function (creep) {
    var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
    var energyResources = _.filter(
      droppedResources,
      (droppedResource) =>
        droppedResource.resourceType == RESOURCE_ENERGY &&
        droppedResource.amount >= creep.store.getFreeCapacity()
    );
    var closestSource = creep.pos.findClosestByPath(energyResources);
    console.log(creep.name + closestSource);

    if (closestSource) {
      if (closestSource instanceof Resource) {
        if (creep.pickup(closestSource) == ERR_NOT_IN_RANGE) {
          var res = creep.moveTo(closestSource, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      }
    }
  },
};

module.exports = utils;
