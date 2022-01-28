var utils = require("utils");
const { pickupEnergy } = require("./utils");

const CONSTUCTION_SITE = "constructionSite";
const MAX_RAMPART_HEALTH = 5000;

/**
 * @param {Creep} creep
 * @param {STRUCTURE_RAMPART} target
 * **/
function repairRamparts(creep, target) {
  var res = creep.repair(target);
  if (res == OK) {
    console.log(creep.name + "here");
    if (target.hits >= MAX_RAMPART_HEALTH) {
      invalidateCreepTargetMemory(creep);
    }
  } else {
    handleCreepActionFailure(res, creep, target);
  }
}

/**
 * @param {Creep} creep
 * @param {RoomPosition} target
 * **/
function construct(creep, target) {
  var res = creep.build(target);
  handleCreepActionFailure(res, creep, target);
}

function storeTargetInCreepMemory(creep, id, type) {
  creep.memory.target = id;
  creep.memory.targetType = type;
}

function findDamagedRamparts(creep) {
  var structures = creep.room.find(FIND_MY_STRUCTURES);
  var ramparts = _.filter(
    structures,
    (structure) =>
      structure.structureType == STRUCTURE_RAMPART && structure.hits < 2000
  );
  return ramparts;
}

/**
 * @param {CreepActionReturnCode} res result
 * @param {Creep} creep
 * @param {RoomPosition} target
 * @return {bool}
 * **/
function handleCreepActionFailure(res, creep, target) {
  if (res == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
  } else if (res != OK) {
    invalidateCreepTargetMemory(creep);
  }
}

/** @param {Creep} creep **/
function invalidateCreepTargetMemory(creep) {
  console.log(creep.name + "here");
  creep.memory.target = null;
  creep.memory.targetType = null;
}

var roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    if (creep.memory.building) {
      if (creep.memory.target) {
        var target = Game.getObjectById(creep.memory.target);
        if ((creep.memory.targetType = STRUCTURE_RAMPART)) {
          return repairRamparts(creep, target);
        } else if ((creep.memory.targetType = CONSTUCTION_SITE)) {
          return construct(creep, target);
        }
      }

    //   if (creep.room.controller.level > 1) {
    //     var ramparts = findDamagedRamparts(creep);
    //     if (ramparts) {
    //       var target = creep.pos.findClosestByPath(ramparts);
    //       if (target) {
    //         storeTargetInCreepMemory(creep, target.id, STRUCTURE_RAMPART);
    //         return repairRamparts(creep, target);
    //       }
    //     }
    //   }
      var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target) {
        storeTargetInCreepMemory(creep, target.id, CONSTUCTION_SITE);
        return construct(creep, target);
      }
    } else {
      utils.pickupEnergy(creep);
    }
  },
};

module.exports = roleBuilder;
