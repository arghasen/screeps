import { Manager } from './Manager';
import { maxRolePopulation, Role, roleNames } from '../constants';
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
    //var energyAvailable = room.energyAvailable;
    var energyAvailable = room.energyCapacityAvailable;

        if(!this.spawns[0].spawning){
    if(this.myCreeps.length =10)
        {
            this.createCreep(250,Role.ROLE_HARVESTER);
            return;
        }
    if (this.myCreeps.length < this.sources.length) {
      this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
    }
    //if (room.controller && room.controller.level <= 2) {
        if(this.numHarversters< maxRolePopulation.harvesters)
            {
              this.createCreep(energyAvailable, Role.ROLE_HARVESTER);
            }

        if (this.numBuilders< maxRolePopulation.builders)
            {
              this.createCreep(energyAvailable, Role.ROLE_BUILDER);
            }
        console.log(this.numUpgraders)
        if(this.numUpgraders< maxRolePopulation.upgrader)
            {
              this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
            }
        if(this.numHaulers< maxRolePopulation.haulers)
            {
              this.createCreep(energyAvailable, Role.ROLE_HAULER);
            }
    //}
  }
  };

  run = () => {
    for (var creep of this.myCreeps) {
      switch (creep.memory.role) {
        case Role.ROLE_HARVESTER:
          Harvester.run(creep);
        break;
        case Role.ROLE_HAULER:
          Hauler.run(creep);
        break;
        case Role.ROLE_BUILDER:
          Builder.run(creep);
        break;
        case Role.ROLE_UPGRADER:
          Upgrader.run(creep);
        break;
      }
    }
  };
  createCreep = (energyAvailable: any, role: Role) => {
    //var body = getBody();
    var body =[WORK,WORK,CARRY,MOVE]
    if(energyAvailable ==250)
        {
            body =[WORK,CARRY,MOVE,MOVE]
        }
    if(energyAvailable == 350)
        {
            body =[WORK,WORK,CARRY,CARRY,MOVE]
        }
    this.spawns[0].spawnCreep(body, roleNames[role] + Game.time, {
      memory: { role: role }
    });
  };

 //getBody =(energyAvailable)
  getWorkerCounts = () => {
    for (var creep of this.myCreeps) {
      switch (creep.memory.role) {
        case Role.ROLE_HARVESTER:
          this.numHarversters = this.numHarversters + 1;
        break;
        case Role.ROLE_HAULER:
          this.numHaulers = this.numHaulers + 1;
        break;
        case Role.ROLE_BUILDER:
          this.numBuilders = this.numBuilders +1;
        break;
        case Role.ROLE_UPGRADER:
          this.numUpgraders = this.numUpgraders +1;
        break;
      }
    }
  };
}
