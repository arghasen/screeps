var utils = require('utils');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        // if there are places to send energy then send else start repairing
        if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {

            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            else {
                creep.memory.repairing = true;
                creep.say('🚧 repair');
                // TODO: Wastes a tick here, can be optimised
            }
        }
        else if (creep.memory.repairing) {
            var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure) {
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDamagedStructure);
                }
            }
            else {
                creep.memory.repairing = false;
            }
        }
        else {
            utils.harvestEnergy(creep);
        }
    }
};


module.exports = roleHarvester;