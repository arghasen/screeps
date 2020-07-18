var roleHarvester = require('role.harvester');

module.exports.loop = function () {

    var spawn = Game.spawns['Spawn1'];
    if (Memory.harvesters) {
        var numHarvesters = Memory.harvesters.length
    }
    else {
        Memory.harvesters = []
    }
    console.log(numHarvesters)
    let creepCount = _.keys(Game.creeps).length;
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleHarvester.run(creep);
    }
    if (spawn.energy == 300 && numHarvesters < 4) {
        let creepName = "Creep" + creepCount
        spawn.spawnCreep([WORK, CARRY, MOVE], creepName);
        Memory.harvesters.push(creepName)
    }
}