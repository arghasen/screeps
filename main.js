var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleContHarvester = require('role.continuousHarvester')
var AiConstants = require('constants');

function cleanupDeadCreeps() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    return name;
}

function runCreeps() {
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
        if (creep.memory.role == 'cont_harvester') {
            roleContHarvester.run(creep);
        }
    }
    return name;
}

function autoSpawnCreeps() {
    createContinousHarverster();
    createHarvester();
    createUpgrader();
    createBuilder();
    
    informSpawing();
}

function informSpawing() {
    if (Game.spawns['Sp1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Sp1'].spawning.name];
        Game.spawns['Sp1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Sp1'].pos.x + 1,
            Game.spawns['Sp1'].pos.y,
            { align: 'left', opacity: 0.8 });
    }
}

function findCurrentCreeps(role) {
    var creep = _.filter(Game.creeps, (creep) => creep.memory.role == role);
    console.log(role + ': ' + creep.length);
    return creep;
}

function createWorkerCreep(body,role,maxCount) {
    var creeps = findCurrentCreeps(role);
    if (creeps.length < maxCount ) {
        var newName = role + Game.time;
        console.log('Spawning new' + role + ': ' + newName);
        Game.spawns['Sp1'].spawnCreep(body, newName,
            { memory: { role: role } });
    }
}

function createUpgrader() {
    createWorkerCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE],'upgrader', AiConstants.maxUpgraders);
}

function createBuilder() {
    createWorkerCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE],'builder',AiConstants.maxBuilders);
}

function createHarvester() {
    createWorkerCreep([WORK, CARRY, CARRY, CARRY, MOVE, MOVE],'harvester',AiConstants.maxHarvesters);
}

function createContinousHarverster() {
    var contHarvesters = findCurrentCreeps('cont_harvester');

    if (contHarvesters.length < AiConstants.maxContHarvesters) {
        var newName = 'ContHarvester' + Game.time;
        console.log('Spawning new continious harvester: ' + newName);
        var res = Game.spawns['Sp1'].spawnCreep([WORK, WORK, WORK, WORK, MOVE], newName,
            { memory: { role: 'cont_harvester', source: Memory.count } });
        if (res == OK) {
            Memory.count = (Memory.count + 1) % 2;
        }
    }
}

module.exports.loop = function () {
    cleanupDeadCreeps();
    autoSpawnCreeps();
    runCreeps();
}