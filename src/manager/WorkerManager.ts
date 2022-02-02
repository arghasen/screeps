import { Manager } from './Manager';
import { maxRolePopulation, Role, roleNames } from '../constants';
import { Harvester } from '../workers/Harvester';
import { Hauler } from '../workers/Hauler';
import { Builder } from '../workers/Builder';
import { Upgrader } from '../workers/Upgrader';
import { ContinuousHarvester } from 'workers/ContinuousHarvester';

export class WorkerManager extends Manager {
  spawns: StructureSpawn[] = [];
  myCreeps: Creep[] = [];
  sources: Source[] = [];

  numHarversters: number = 0;
  numBuilders: number = 0;
  numHaulers: number = 0;
  numUpgraders: number = 0;
  numContinuousHarvesters: number = 0;
  room: Room;

  init = (room: Room) => {
    this.room = room;
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
    if (this.numContinuousHarvesters > 1) {
      Memory.continuousHarvestingStarted = true;
    }
    //var energyAvailable = room.energyAvailable;
    var energyAvailable = room.energyCapacityAvailable;

    this.creapCreator(room, energyAvailable); // Early returns are possible in this function, so be careful in putting code below.
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
        case Role.ROLE_CONTINUOUS_HARVESTER:
          ContinuousHarvester.run(creep);
      }
    }
  };

  createCreep = (energyAvailable: number, role: Role) => {
    //var body = getBody();
    var body = this.getBody(energyAvailable, role);

    var ret = this.spawns[0].spawnCreep(body, roleNames[role] + Game.time, {
      memory: { role: role }
    });
    console.log(
      'Creep creation with body:' +
        body +
        ' role: ' +
        roleNames[role] +
        ' result: ' +
        ret
    );
    return ret;
  };

  //getBody =(energyAvailable)
  getWorkerCounts = () => {
    for (var creep of this.myCreeps) {
      console.log('worker counting:' + creep);
      switch (creep.memory.role) {
        case Role.ROLE_HARVESTER:
          this.numHarversters = this.numHarversters + 1;
          break;
        case Role.ROLE_UPGRADER:
          this.numUpgraders = this.numUpgraders + 1;
          break;
        case Role.ROLE_HAULER:
          this.numHaulers = this.numHaulers + 1;
          break;
        case Role.ROLE_BUILDER:
          this.numBuilders = this.numBuilders + 1;
          break;
        case Role.ROLE_CONTINUOUS_HARVESTER:
          this.numContinuousHarvesters = this.numContinuousHarvesters + 1;
      }
    }
    console.log(
      'Workers:, harv:' +
        this.numHarversters +
        ' build: ' +
        this.numBuilders +
        ' upgrade: ' +
        this.numUpgraders +
        ' haul:' +
        this.numHaulers
    );
  };

  private getBody(energyAvailable: number, role: Role) {
    var body = [WORK, WORK, CARRY, MOVE];
    if (energyAvailable == 250) {
      body = [WORK, CARRY, MOVE, MOVE];
    }
    if (energyAvailable == 350) {
      body = [WORK, WORK, CARRY, CARRY, MOVE];
    }
    if (energyAvailable >= 500 && role == Role.ROLE_UPGRADER) {
      body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
    }
    if (role == Role.ROLE_CONTINUOUS_HARVESTER) {
      body = this.getContinuousHarvesterBody(energyAvailable, body);
    }

    if (role == Role.ROLE_HAULER) {
      body = this.getHaulerBody(energyAvailable, body);
    }
    return body;
  }

  private getHaulerBody(
    energyAvailable: number,
    body: ('work' | 'carry' | 'move')[]
  ) {
    if (energyAvailable == 300) {
      body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    } else if (energyAvailable == 400) {
      body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    } else if (energyAvailable >= 500) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
    return body;
  }

  private getContinuousHarvesterBody(
    energyAvailable: number,
    body: ('work' | 'carry' | 'move')[]
  ) {
    if (energyAvailable == 350) {
      body = [WORK, WORK, WORK, MOVE];
    } else if (energyAvailable == 450) {
      body = [WORK, WORK, WORK, WORK, MOVE];
    } else if (energyAvailable >= 550) {
      body = [WORK, WORK, WORK, WORK, WORK, MOVE];
    }
    return body;
  }

  private creapCreator(room: Room, energyAvailable: number) {
    if (!this.spawns[0].spawning) {
      // FIXME : We can probably have better logic for restart in emergency
      if (this.myCreeps.length == 0 || this.numHarversters == 0) {
        this.createCreep(250, Role.ROLE_HARVESTER);
        return;
      }
      if (this.myCreeps.length < this.sources.length) {
        if (
          room.controller &&
          room.controller.level > 1 &&
          room.energyCapacityAvailable >= 350
        ) {
          var res = this.createCreep(
            energyAvailable,
            Role.ROLE_CONTINUOUS_HARVESTER
          );
          if (res == ERR_NOT_ENOUGH_ENERGY) {
            console.log(
              'skipping creation of creeps till energy for continuous harvesters is available'
            );
            return;
          }
          if (res == OK) {
            Memory.count = Memory.count + 1;
          }
        } else {
          this.createCreep(250, Role.ROLE_HARVESTER);
        }
      }

      this.populationBasedCreepCreator(energyAvailable);
    }
  }

  private populationBasedCreepCreator(energyAvailable: number) {
    var ret = this.createContinuousHarvester(energyAvailable);
    if (ret == OK || ret == ERR_NOT_ENOUGH_ENERGY) {
      return;
    }
    this.createHaulers(energyAvailable);

    this.createHarvesters(energyAvailable);

    this.createBuilders(energyAvailable);

    this.createUpgraders(energyAvailable);
  }

  private createContinuousHarvester(energyAvailable: number) {
    if (
      this.numContinuousHarvesters < maxRolePopulation.continuous_harvester &&
      energyAvailable >= 350
    ) {
      var res = this.createCreep(
        energyAvailable,
        Role.ROLE_CONTINUOUS_HARVESTER
      );
      if (res == ERR_NOT_ENOUGH_ENERGY) {
        console.log(
          'skipping creation of creeps till energy for continuous harvesters is available'
        );
      }
      if (res == OK) {
        Memory.count = Memory.count + 1;
      }
      return res;
    }
    return ERR_RCL_NOT_ENOUGH;
  }

  private createUpgraders(energyAvailable: number) {
    if (this.room.controller) {
      if (this.room.controller.level > 1) {
        if (Memory.focus == 'upgrade') {
          if (this.numUpgraders < maxRolePopulation.upgrader) {
            this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
          }
        } else {
          if (this.numUpgraders < maxRolePopulation.upgrader - 4) {
            this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
          }
        }
      }
    } else {
      if (this.numUpgraders < maxRolePopulation.upgrader) {
        this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
      }
    }
  }

  private createHarvesters(energyAvailable: number) {
    if (this.numHarversters < maxRolePopulation.harvesters) {
      this.createCreep(energyAvailable, Role.ROLE_HARVESTER);
    }
  }

  private createHaulers(energyAvailable: number) {
    if (
      this.numHaulers < maxRolePopulation.haulers &&
      Memory.continuousHarvestingStarted
    ) {
      this.createCreep(energyAvailable, Role.ROLE_HAULER);
    }
  }

  private createBuilders(energyAvailable: number) {
    if (this.room.controller) {
      if (this.room.controller.level > 1) {
        if (Memory.focus == 'build') {
          if (this.numBuilders < maxRolePopulation.builders + 4) {
            this.createCreep(energyAvailable, Role.ROLE_BUILDER);
          }
        } else {
          if (this.numBuilders < maxRolePopulation.builders) {
            this.createCreep(energyAvailable, Role.ROLE_BUILDER);
          }
        }
      }
    }
  }
}
