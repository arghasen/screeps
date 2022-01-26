var utils = {

    /** @param {Creep}  creep **/
    harvestEnergy: function (creep) {
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            var res = creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            if(res==ERR_NO_PATH)
            {
                creep.move(_.random(1,8)); // FIXME: move in a random direction if no path found
            }
        }
    }
};

module.exports = utils;