const { pickupEnergy } = require("./utils");

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
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    } else {
      pickupEnergy(creep);
    }
  },
};

module.exports = roleRunner;
