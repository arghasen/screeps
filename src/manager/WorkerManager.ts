import { Manager } from './Manager';
import { Role } from '../constants';
import { Harvester } from '../workers/Harvester';
import { Hauler } from '../workers/Hauler';
import { Builder } from '../workers/Builder';
import { Upgrader } from '../workers/Upgrader';

export class WorkerManager extends Manager {
  spawns: StructureSpawn[] = [];
  myCreeps: Creep[] = [];
  sources: Source[] = [];
  numHarversters: number = 0;
  numBuilders: number = 0;
  numHaulers: number = 0;
  numUpgraders: number = 0;
  init = (room: Room) => {
    var gameSpawns = Game.spawns;
    for (var spawnName in gameSpawns) {
      if (gameSpawns[spawnName].room.name == room.name) {
        this.spawns.push(gameSpawns[spawnName]);
      }
    }
    this.myCreeps = _.values(Game.creeps);
    console.log(JSON.stringify(Game.creeps));
    console.log(this.myCreeps);
    this.sources = room.find(FIND_SOURCES);

    getWorkerCounts();
    if (this.myCreeps.length < this.sources.length) {
      var energyAvailable = room.energyAvailable;
      this.createCreep(energyAvailable, Role.ROLE_HARVESTER);
    }
    if (room.controller?.level == 2) {
      this.createCreep(energyAvailable, Role.ROLE_BUILDER);
    }
  };

  run = () => {
    for (var creep of this.myCreeps) {
      switch (creep.memory.role) {
        case Role.ROLE_HARVESTER:
          Harvester.run(creep);
        case Role.ROLE_HAULER:
          Hauler.run(creep);
        case Role.ROLE_BUILDER:
          Builder.run(creep);
        case Role.ROLE_UPGRADER:
          Upgrader.run(creep);
      }
    }
  };
  createCreep = (energyAvailable: any, role: Role) => {
    this.spawns[0].spawnCreep([WORK, CARRY, MOVE], 'creep' + Game.time, {
      memory: { role: role }
    });
  };

  getWorkerCounts = () => {
    for (var creep of this.myCreeps) {
      switch (creep.memory.role) {
        case Role.ROLE_HARVESTER:
          this.numHarversters = this.numHarversters + 1;
        case Role.ROLE_HAULER:
          this.numHaulers = this.numHaulers + 1;
        case Role.ROLE_BUILDER:
          this.numBuilders = this.numBuilders;
        case Role.ROLE_UPGRADER:
          this.numUpgraders = this.numUpgraders;
      }
    }
  };
}
