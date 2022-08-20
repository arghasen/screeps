import { logger } from '../../utils/logger';
import { maxRolePopulation, Role, roleNames } from '../constants';
import { Builder } from '../workers/Builder';
import { ContinuousHarvester } from '../workers/ContinuousHarvester';
import { Harvester } from '../workers/Harvester';
import { Hauler } from '../workers/Hauler';
import { Upgrader } from '../workers/Upgrader';
import { Manager } from './Manager';

export class WorkerManager extends Manager {
  public spawns: StructureSpawn[] = [];
  public myCreeps: Creep[] = [];
  public sources: Source[] = [];

  public numHarversters: number = 0;
  public numBuilders: number = 0;
  public numHaulers: number = 0;
  public numUpgraders: number = 0;
  public numContinuousHarvesters: number = 0;
  public room!: Room;

  public init = (room: Room): void => {
    this.room = room;
    for (const spawnName of Object.keys(Game.spawns)) {
      if (Game.spawns[spawnName].room.name === room.name) {
        this.spawns.push(Game.spawns[spawnName]);
      }
    }
    this.myCreeps = _.values(Game.creeps);
    logger.printObject(Game.creeps);
    this.sources = room.find(FIND_SOURCES);

    this.getWorkerCounts();
    if (this.numContinuousHarvesters > 1) {
      Memory.continuousHarvestingStarted = true;
    }
    // var energyAvailable = room.energyAvailable;
    const energyAvailable: number = room.energyCapacityAvailable;

    this.creapCreator(room, energyAvailable); // Early returns are possible in this function, so be careful in putting code below.
  };

  public run = (): void => {
    for (const creep of this.myCreeps) {
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
        default:
          _.noop();
      }
    }
  };

  public createCreep = (
    energyAvailable: number,
    role: Role
  ): ScreepsReturnCode => {
    const body: BodyPartConstant[] = this.getBody(energyAvailable, role);

    const ret: ScreepsReturnCode = this.spawns[0].spawnCreep(
      body,
      roleNames[role] + Game.time,
      {
        memory: { role: role }
      }
    );
    logger.info(
      `Creep creation with body:${body} role: ${roleNames[role]} result: ${ret}`
    );

    return ret;
  };

  public getWorkerCounts = () => {
    for (const creep of this.myCreeps) {
      logger.debug(`worker counting:${creep}`);
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
          break;
        default:
          logger.error('Invalid role: %s', creep.memory.role);
      }
    }
    logger.info(
      `Workers:, harv:${this.numHarversters} build: ${this.numBuilders} upgrade: ${this.numUpgraders} haul:${this.numHaulers}`
    );
  };

  private getBody(energyAvailable: number, role: Role): BodyPartConstant[] {
    let body: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE];
    if (energyAvailable === 250 || energyAvailable === 300) {
      body = [WORK, CARRY, MOVE, MOVE];
    }
    if (energyAvailable === 350) {
      body = [WORK, WORK, CARRY, CARRY, MOVE];
    }
    if (energyAvailable >= 500 && role === Role.ROLE_UPGRADER) {
      body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
    }
    if (role === Role.ROLE_CONTINUOUS_HARVESTER) {
      body = this.getContinuousHarvesterBody(energyAvailable);
    }

    if (role === Role.ROLE_HAULER) {
      body = this.getHaulerBody(energyAvailable);
    }
    return body;
  }

  private getHaulerBody(energyAvailable: number): BodyPartConstant[] {
    let body: BodyPartConstant[] = [];
    if (energyAvailable === 300) {
      body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    } else if (energyAvailable === 400) {
      body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    } else if (energyAvailable >= 500) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
    return body;
  }

  private getContinuousHarvesterBody(
    energyAvailable: number
  ): BodyPartConstant[] {
    let body: BodyPartConstant[] = [];
    if (energyAvailable === 350 || energyAvailable === 400) {
      body = [WORK, WORK, WORK, MOVE];
    } else if (energyAvailable === 450 || energyAvailable === 500) {
      body = [WORK, WORK, WORK, WORK, MOVE];
    } else if (energyAvailable >= 550) {
      body = [WORK, WORK, WORK, WORK, WORK, MOVE];
    }
    return body;
  }

  private creapCreator(room: Room, energyAvailable: number) {
    if (!this.spawns[0].spawning) {
      // FIXME : We can probably have better logic for restart in emergency
      if (this.myCreeps.length === 0 || this.numHarversters === 0) {
        this.createCreep(250, Role.ROLE_HARVESTER);
        return;
      }
      if (this.myCreeps.length < this.sources.length) {
        if (
          room.controller &&
          room.controller.level > 1 &&
          room.energyCapacityAvailable >= 350
        ) {
          const res = this.createCreep(
            energyAvailable,
            Role.ROLE_CONTINUOUS_HARVESTER
          );
          if (res === ERR_NOT_ENOUGH_ENERGY) {
            logger.warning(
              'skipping creation of creeps till energy for continuous harvesters is available'
            );
            return;
          }
          if (res === OK) {
            Memory.count = Memory.count + 1;
          }
        } else {
          this.createCreep(250, Role.ROLE_HARVESTER);
        }
      }

      this.populationBasedCreepCreator(energyAvailable);
    }
  }

  private populationBasedCreepCreator(energyAvailable: number): void {
    const ret = this.createContinuousHarvester(energyAvailable);
    if (ret === OK || ret === ERR_NOT_ENOUGH_ENERGY) {
      return;
    }

    this.createHaulers(energyAvailable);
    this.createHarvesters(energyAvailable);
    this.createBuilders(energyAvailable);
    this.createUpgraders(energyAvailable);
  }

  private createContinuousHarvester(
    energyAvailable: number
  ): ScreepsReturnCode {
    if (
      this.numContinuousHarvesters < maxRolePopulation.continuous_harvester &&
      energyAvailable >= 350
    ) {
      const res = this.createCreep(
        energyAvailable,
        Role.ROLE_CONTINUOUS_HARVESTER
      );
      if (res === ERR_NOT_ENOUGH_ENERGY) {
        logger.warning(
          'skipping creation of creeps till energy for continuous harvesters is available'
        );
      }
      if (res === OK) {
        Memory.count = Memory.count + 1;
      }
      return res;
    }
    return ERR_RCL_NOT_ENOUGH;
  }

  private createUpgraders(energyAvailable: number): ScreepsReturnCode {
    if (this.room.controller) {
      if (this.room.controller.level > 1) {
        if (Memory.focus === 'upgrade') {
          if (this.numUpgraders < maxRolePopulation.upgrader + 4) {
            return this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
          }
        } else {
          if (this.numUpgraders < maxRolePopulation.upgrader - 4) {
            return this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
          }
        }
      } else {
        if (this.numUpgraders < maxRolePopulation.upgrader) {
          return this.createCreep(energyAvailable, Role.ROLE_UPGRADER);
        }
      }
    }
    return ERR_NOT_OWNER;
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
        if (Memory.focus === 'build') {
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
