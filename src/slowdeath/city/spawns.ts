import { Process } from "../../os/process";
import {
  CreepTask,
  MaxPopulationPerRoom,
  MaxRolePopulation,
  Role,
  roleNames
} from "slowdeath/creepActions/constants";
import { logger } from "../../utils/logger";
import { spawnsInRoom } from "../../utils/screeps-fns";
import {
  getBuilderBody,
  getClaimer,
  getContinuousHarvestor,
  getEmergencyCreep,
  getHauler,
  getMineralMinerBody,
  getRemoteBuilder,
  getRemoteMiner,
  getSpawnCost,
  getUpgraderBody
} from "./creepBuilder";

export class Spawns extends Process {
  protected className = "spawns";
  private metadata?: CityData;
  private room!: Room;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting spawnner in ${this.metadata.roomName}`);

    if (!this.roomExists()) {
      logger.info(`${this.className}: Room ${this.metadata.roomName} does not exist`);
      return this.suicide();
    }

    this.room = Game.rooms[this.metadata.roomName];
    if (!this.room.memory.spawnQueue) {
      this.room.memory.spawnQueue = [];
    }
    logger.info(
      ` energy Available: ${this.room.energyAvailable} capacity: ${this.room.energyCapacityAvailable}`
    );
    if (!this.room.controller) {
      return;
    }
    const spawns = spawnsInRoom(this.room);
    if (spawns.length === 0) {
      return;
    }
    const roomName = this.room.name;
    const myCreeps = _.filter(Game.creeps, (creep: Creep) => {
      return creep.pos.roomName === roomName;
    });

    if (!this.needSpawning(myCreeps)) {
      return;
    }

    this.spawnCreeps(spawns);
  }

  private spawnCreeps(spawns: StructureSpawn[]) {
    for (const spawn of spawns) {
      if (spawn.spawning) {
        continue;
      }

      const energyCapacityAvailable = this.room.energyCapacityAvailable;
      const creep = this.getCreepToSpawn(energyCapacityAvailable);

      if (creep) {
        if (getSpawnCost(creep.build) <= this.room.energyAvailable) {
          logger.info(`got creep to create: ${logger.json(creep)}`);
          this.createCreep(spawn, creep);
        } else {
          logger.debug(
            `queuing creep to create: ${logger.json(creep)} and energy available: ${this.room.energyAvailable
            }`
          );
          this.queueCreep(creep);
        }
      } else {
        logger.debug("invalid creep to create");
      }
    }
  }

  private roomExists(): boolean {
    return !!this.metadata && !!Game.rooms[this.metadata.roomName];
  }

  private queueCreep(creep: CreepSpawnData) {
    creep.name = getName();
    this.room.memory.spawnNext = creep;

    function getName(): string {
      const pos = creep.name.lastIndexOf("_");
      if (pos !== -1) {
        return `${creep.name.substring(0, pos)}_${Math.random().toFixed(2)}`;
      } else {
        return `${creep.name}_ ${Math.random().toFixed(2)}`;
      }
    }
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
    if (Memory.createClaimer && creep.options.memory?.role === Role.CLAIMER) {
      Memory.createClaimer.done = creep.name;
    } else if (
      Memory.needBuilder &&
      Memory.needBuilder.sent === "" &&
      creep.options.memory?.role === Role.BUILDER
    ) {
      Memory.needBuilder.sent = creep.name;
    } else if (creep.options.memory?.role === Role.CONTINUOUS_HARVESTER) {
      this.room.memory.createContinuousHarvester = false;
    } else {
      this.room.memory.spawnQueue.shift();
    }
  }

  private getCreepToSpawn(energyCapacityAvailable: number): CreepSpawnData | null {
    const room = Game.rooms[this.room.name];
    if (room.memory.critical) {
      return getEmergencyCreep(this.room.name);
    }
    if (this.room.memory.createContinuousHarvester) {
      return getContinuousHarvestor(energyCapacityAvailable, this.room.name);
    }

    if (Memory.createClaimer && !Memory.createClaimer.done) {
      return getClaimer(energyCapacityAvailable, this.room.name);
    }

    if (Memory.needBuilder && Memory.needBuilder.sent === "") {
      return getRemoteBuilder(energyCapacityAvailable, this.room.name);
    }

    // Check if we need remote miners
    const remoteMiners = _.filter(
      Game.creeps,
      (creep: Creep) => creep.memory.role === Role.REMOTE_MINER
    );
    const numRemoteMiners = 2 + (this.room.memory.continuousHarvestingStarted ? 2 : 0);
    if (remoteMiners.length < numRemoteMiners && !this.room.memory.enemy) {
      // Maintain 2 remote miners
      return getRemoteMiner(energyCapacityAvailable, this.room.name);
    }


    const creepRole = this.room.memory.spawnQueue[0];
    if (creepRole !== undefined) {
      logger.debug(`Using spawn queue to create creep: ${roleNames[creepRole]}`);
      return this.getQueuedCreep(this.room.name, energyCapacityAvailable, creepRole);
    }

    return null;
  }

  private needSpawning(myCreeps: Creep[]) {
    if (this.room.memory.spawnQueue?.length > 0) {
      return true;
    }
    return (
      myCreeps.length <=
      MaxPopulationPerRoom[this.room.controller!.level] + MaxRolePopulation.continuousHarvester ||
      this.room.memory.createContinuousHarvester ||
      (Memory.createClaimer && !Memory.createClaimer.done) ||
      (Memory.needBuilder && Memory.needBuilder?.sent === "")
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
    if (role === Role.HAULER) {
      return getHauler(energyCapacityAvailable, role, roomName);
    }
    if (role === Role.MINERAL_MINER && !this.room.memory.enemy) {
      return {
        build: getMineralMinerBody(energyCapacityAvailable, roomName),
        name: `${roleNames[role]}-${Game.time}`,
        options: { memory: { role, task: CreepTask.UNKNOWN, homeRoom: roomName } }
      };
    }
    if (role === Role.UPGRADER) {
      const staticUpgrades = this.room.memory.linksCreated
      return {
        build: getUpgraderBody(energyCapacityAvailable, staticUpgrades),
        name: `${roleNames[role]}-${Game.time}`,
        options: { memory: { role, task: CreepTask.UNKNOWN, homeRoom: roomName } }
      };
    }
    const body = getBuilderBody(energyCapacityAvailable);

    return {
      build: body,
      name: `${roleNames[role]}-${Game.time}`,
      options: { memory: { role, task: CreepTask.UNKNOWN, homeRoom: roomName } }
    };
  }
}
