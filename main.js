var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var AiConstants = require('constants');

module.exports.loop = function () {

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if (harvesters.length < AiConstants.maxHarvesters) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Sp1'].spawnCreep([WORK, CARRY, CARRY, MOVE], newName,
            { memory: { role: 'harvester' } });
    }

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('upgraders: ' + upgraders.length);

    if (upgraders.length < AiConstants.maxUpgraders) {
        var newName = 'upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Sp1'].spawnCreep([WORK, CARRY, CARRY, MOVE], newName,
            { memory: { role: 'upgrader' } });
    }

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('builders: ' + upgraders.length);

    if (builders.length < AiConstants.maxBuilders) {
        var newName = 'builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Sp1'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE], newName,
            { memory: { role: 'builder' } });
    }

    if (Game.spawns['Sp1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Sp1'].spawning.name];
        Game.spawns['Sp1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Sp1'].pos.x + 1,
            Game.spawns['Sp1'].pos.y,
            { align: 'left', opacity: 0.8 });
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}