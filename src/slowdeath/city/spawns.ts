import { Process } from "../../os/process";
import {
  MaxPopulationPerRoom,
  MaxRolePopulation,
  Role,
  roleNames
} from "slowdeath/creepActions/constants";
import { logger } from "../../utils/logger";
import { spawnsInRoom } from "../../utils/screeps-fns";
import {
  getBuilderBody,
  getContinuousHarvesterBody,
  getHaulerBody,
  getSpawnCost
} from "./creepBuilder";

export class Spawns extends Process {
  protected className = "spawns";
  private metadata?: CityData;
  private room!: Room;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting spawnner in ${this.metadata.roomName}`);

    if (!Game.rooms[this.metadata.roomName]) {
      return this.suicide();
    }

    this.room = Game.rooms[this.metadata.roomName];
    logger.info(
      ` energy Available: ${this.room.energyAvailable} capacity: ${this.room.energyCapacityAvailable}`
    );
    if (this.room.controller) {
      const spawns = spawnsInRoom(this.room);
      const roomName = this.room.name;
      const myCreeps = _.filter(Game.creeps, creep => {
        return creep.pos.roomName === roomName;
      });

      if (!this.needSpawning(myCreeps)) {
        return;
      }

      for (const spawn of spawns) {
        if (spawn.spawning) {
          continue;
        }

        const energyCapacityAvailable = this.room.energyCapacityAvailable;
        const creep = this.getCreepToSpawn(energyCapacityAvailable);

        if (creep) {
          //this.createCreep(spawn, creep);
          if (getSpawnCost(creep.build) <= this.room.energyAvailable) {
            logger.info(`got creep to create: ${logger.json(creep)}`);
            this.createCreep(spawn, creep);
          } else {
            logger.debug(
              `queuing creep to create: ${logger.json(creep)} and energy available: ${
                this.room.energyAvailable
              }`
            );
            this.queueCreep(creep);
          }
        } else {
          logger.debug("invalid creep to create");
        }
      }
    }
  }
  private queueCreep(creep: CreepSpawnData) {
    const pos = creep.name.lastIndexOf("_");
    if (pos != -1) {
      creep.name = `${creep.name.substring(0, pos)}_${Math.random().toFixed(2)}`;
    } else {
      creep.name = `${creep.name}_ ${Math.random().toFixed(2)}`;
    }
    this.room.memory.spawnNext = creep;
  }

  private createCreep(spawn: StructureSpawn, creep: CreepSpawnData) {
    const ret = spawn.spawnCreep(creep.build, creep.name, creep.options);
    if (ret !== OK) {
      logger.error(`${ret} while spawning creep ${creep.name} in room ${this.metadata!.roomName}`);
    } else {
      logger.info(`Spawning successful creep ${creep.name} from ${this.metadata!.roomName}`);
      this.onCreateSuccess(creep);
    }
  }

  private onCreateSuccess(creep: CreepSpawnData) {
    if (Memory.createClaimer && creep.options.memory?.role == Role.ROLE_CLAIMER) {
      Memory.createClaimer.done = creep.name;
    } else if (
      Memory.needBuilder &&
      Memory.needBuilder.sent == "" &&
      creep.options.memory?.role == Role.ROLE_BUILDER
    ) {
      Memory.needBuilder.sent = creep.name;
    } else if (creep.options.memory?.role == Role.ROLE_CONTINUOUS_HARVESTER) {
      this.room.memory.createContinuousHarvester = false;
    } else {
      this.room.memory.spawnQueue.shift();
    }
  }

  private getCreepToSpawn(energyCapacityAvailable: number): CreepSpawnData | null {
    const room = Game.rooms[this.room.name];
    if (room.memory.critical) {
      return this.getEmergencyCreep();
    }
    if (this.room.memory.createContinuousHarvester) {
      return this.getContinuousHarvestor(energyCapacityAvailable);
    } else if (Memory.createClaimer && !Memory.createClaimer.done) {
      return this.getClaimer(energyCapacityAvailable);
    } else if (Memory.needBuilder && Memory.needBuilder.sent === "") {
      return this.getRemoteBuilder(energyCapacityAvailable);
    } else {
      const creepRole = this.room.memory.spawnQueue[0];
      if (creepRole != undefined) {
        logger.debug(`Using spawn queue to create creep: ${roleNames[creepRole]}`);
        return this.getQueuedCreep(this.room.name, energyCapacityAvailable, creepRole);
      }
    }
    return null;
  }

  private getEmergencyCreep(): CreepSpawnData {
    return {
      build: [WORK, CARRY, MOVE],
      name: `$emergency-${Game.time}`,
      options: { memory: { role: Role.ROLE_HARVESTER, harvesting: false } }
    };
  }

  private getContinuousHarvestor(energyCapacityAvailable: number): CreepSpawnData {
    return {
      build: getContinuousHarvesterBody(energyCapacityAvailable),
      name: `cont_harv-${Game.time}`,
      options: { memory: { role: Role.ROLE_CONTINUOUS_HARVESTER, harvesting: false } }
    };
  }

  private getRemoteBuilder(energyCapacityAvailable: number): CreepSpawnData {
    return {
      build: getBuilderBody(energyCapacityAvailable),
      name: `rembuilder-${Game.time}`,
      options: {
        memory: {
          role: Role.ROLE_BUILDER,
          moveLoc: Memory.needBuilder.moveLoc,
          harvesting: false
        }
      }
    };
  }

  private getClaimer(energyCapacityAvailable: number): CreepSpawnData | null {
    let body: BodyPartConstant[] = [];
    if (energyCapacityAvailable >= 650) {
      body = [CLAIM, MOVE];
      return {
        build: body,
        name: `creep-${Game.time}`,
        options: {
          memory: {
            role: Role.ROLE_CLAIMER,
            moveLoc: Memory.createClaimer?.loc,
            identifier: Memory.createClaimer?.identifier,
            harvesting: false
          }
        }
      };
    }
    return null;
  }

  private getHauler(energyCapacityAvailable: number, role: Role): CreepSpawnData {
    return {
      build: getHaulerBody(energyCapacityAvailable),
      name: `${roleNames[role]}-${Game.time}`,
      options: { memory: { role: role, harvesting: false } }
    };
  }

  private needSpawning(myCreeps: Creep[]) {
    return (
      myCreeps.length <=
        MaxPopulationPerRoom[this.room.controller!.level] + MaxRolePopulation.continuousHarvester ||
      this.room.memory.createContinuousHarvester ||
      (Memory.createClaimer && !Memory.createClaimer.done) ||
      (Memory.needBuilder && Memory.needBuilder?.sent == "")
    );
  }

  private getQueuedCreep(
    roomName: string,
    energyCapacityAvailable: number,
    role: Role
  ): CreepSpawnData {
    if (this.room.memory.spawnNext) {
      const next = _.cloneDeep(this.room.memory.spawnNext);
      delete this.room.memory.spawnNext;
      return next;
    }
    if (role == Role.ROLE_HAULER) {
      return this.getHauler(energyCapacityAvailable, role);
    }
    if (energyCapacityAvailable > 400 && energyCapacityAvailable <= 600) {
      return {
        build: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        name: `${roleNames[role]}-${Game.time}`,
        options: { memory: { role: role, harvesting: false } }
      };
    } else if (energyCapacityAvailable > 600 && energyCapacityAvailable < 1000) {
      return {
        build: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        name: `${roleNames[role]}-${Game.time}`,
        options: { memory: { role: role, harvesting: false } }
      };
    } else if (energyCapacityAvailable > 1100) {
      return {
        build: [
          WORK,
          WORK,
          WORK,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        name: `${roleNames[role]}-${Game.time}`,
        options: { memory: { role: role, harvesting: false } }
      };
    } else {
      return {
        build: [WORK, CARRY, MOVE],
        name: `${roleNames[role]}-${Game.time}`,
        options: { memory: { role: role, harvesting: false } }
      };
    }
  }
}
