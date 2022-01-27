var utils = {

    /** @param {Creep}  creep **/
    harvestEnergy: function (creep) {
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
            var res = creep.moveTo(sources[creep.memory.source], { visualizePathStyle: { stroke: '#ffaa00' } });
            if (res == ERR_NO_PATH) {
                creep.move(_.random(1, 8)); // FIXME: move in a random direction if no path found
            }
        }
    },
    /** @param {Creep}  creep **/
    pickupEnergy: function (creep) {
      // var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
      // var sources = creep.room.find(FIND_SOURCES)
      //  var allEnergy = droppedResources.concat(sources)
        var source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
            {filter:(sources)=>sources.resourceType==RESOURCE_ENERGY && sources.amount > 150});
        if (source) {
            if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                var res = creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } 
    }
};

module.exports = utils;