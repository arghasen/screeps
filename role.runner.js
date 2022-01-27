const { pickupDroppedEnergy } = require("./utils");

function getStructuresNeedingEnergy(creep) {
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

function getStorgesWithFreeCapacity(creep, target) {
  var structures = creep.room.find(FIND_STRUCTURES);
  var targets = _.filter(structures, (structure) => {
    return (
      (structure.structureType == STRUCTURE_CONTAINER ||
        structure.structureType == STRUCTURE_STORAGE) &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
  });
  console.log(creep.name + targets);
  var target = creep.pos.findClosestByPath(targets);
  console.log(target);
  return target;
}

function transferEnergy(creep, target) {
  if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
  }
}

var roleRunner = {
  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.memory.running && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.running = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.running && creep.store.getFreeCapacity() == 0) {
      creep.memory.running = true;
      creep.say("🚧 running");
    }

    if (creep.memory.running) {
      var target = getStructuresNeedingEnergy(creep);
      if (target) {
        transferEnergy(creep, target);
      } // no target exist, then transfer energy to stores
      else {
        var target = getStorgesWithFreeCapacity(creep, target);
        if (target) {
          transferEnergy(creep, target);
        } else {
          creep.memory.running = false;
        }
      }
    } else {
      pickupDroppedEnergy(creep);
    }
  },
};

module.exports = roleRunner;
