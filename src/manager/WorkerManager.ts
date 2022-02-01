import { Manager } from './Manager';
import { maxRolePopulation, Role } from '../constants';
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

    this.getWorkerCounts();
    var energyAvailable = room.energyAvailable;

        if(this.spawns[0].spawning){
    if (this.myCreeps.length < this.sources.length) {
      this.createCreep(energyAvailable, Role.ROLE_HARVESTER);
    }
    if (room.controller?.level == 2) {
        if(this.numHarversters< maxRolePopulation.harvesters)
            {
              this.createCreep(energyAvailable, Role.ROLE_HARVESTER);
            }

        if(this.numHarversters< maxRolePopulation.builders)
            {
              this.createCreep(energyAvailable, Role.ROLE_BUILDER);
            }
        if(this.numHarversters< maxRolePopulation.upgrader)
            {
              this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
            }
        if(this.numHarversters< maxRolePopulation.haulers)
            {
              this.createCreep(energyAvailable, Role.ROLE_HAULER);
            }
    }
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
    //var body = getBody();
    this.spawns[0].spawnCreep([WORK, CARRY, MOVE], 'creep' + Game.time, {
      memory: { role: role }
    });
  };

 //getBody =(energyAvailable)
  getWorkerCounts = () => {
    for (var creep of this.myCreeps) {
      switch (creep.memory.role) {
        case Role.ROLE_HARVESTER:
          this.numHarversters = this.numHarversters + 1;
        case Role.ROLE_HAULER:
          this.numHaulers = this.numHaulers + 1;
        case Role.ROLE_BUILDER:
          this.numBuilders = this.numBuilders +1;
        case Role.ROLE_UPGRADER:
          this.numUpgraders = this.numUpgraders +1;
      }
    }
  };
}
