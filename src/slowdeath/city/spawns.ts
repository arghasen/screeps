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
  getClaimer,
  getContinuousHarvestor,
  getEmergencyCreep,
  getHauler,
  getRemoteBuilder,
  getSpawnCost
} from "./creepBuilder";

export class Spawns extends Process {
  protected className = "spawns";
  private metadata?: CityData;
  private room!: Room;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting spawnner in ${this.metadata.roomName}`);

    if (!this.roomExists()) {
      return this.suicide();
    }

    this.room = Game.rooms[this.metadata.roomName];
    logger.info(
      ` energy Available: ${this.room.energyAvailable} capacity: ${this.room.energyCapacityAvailable}`
    );
    if (!this.room.controller) {
      return;
    }
    const spawns = spawnsInRoom(this.room);
    if (spawns.length == 0) {
      return
    }
    const roomName = this.room.name;
    const myCreeps = _.filter(Game.creeps, creep => {
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
        //this.createCreep(spawn, creep);
        if (getSpawnCost(creep.build) <= this.room.energyAvailable) {
          logger.info(`got creep to create: ${logger.json(creep)}`);
          this.createCreep(spawn, creep);
        } else {
          logger.debug(
            `queuing creep to create: ${logger.json(creep)} and energy available: ${this.room.energyAvailable}`
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
      if (pos != -1) {
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
    if (Memory.createClaimer && creep.options.memory?.role == Role.CLAIMER) {
      Memory.createClaimer.done = creep.name;
    } else if (
      Memory.needBuilder &&
      Memory.needBuilder.sent == "" &&
      creep.options.memory?.role == Role.BUILDER
    ) {
      Memory.needBuilder.sent = creep.name;
    } else if (creep.options.memory?.role == Role.CONTINUOUS_HARVESTER) {
      this.room.memory.createContinuousHarvester = false;
    } else {
      this.room.memory.spawnQueue.shift();
    }
  }

  private getCreepToSpawn(energyCapacityAvailable: number): CreepSpawnData | null {
    const room = Game.rooms[this.room.name];
    if (room.memory.critical) {
      return getEmergencyCreep();
    }
    if (this.room.memory.createContinuousHarvester) {
      return getContinuousHarvestor(energyCapacityAvailable);
    }

    if (Memory.createClaimer && !Memory.createClaimer.done) {
      return getClaimer(energyCapacityAvailable);
    }

    if (Memory.needBuilder && Memory.needBuilder.sent === "") {
      return getRemoteBuilder(energyCapacityAvailable);
    }

    const creepRole = this.room.memory.spawnQueue[0];
    if (creepRole != undefined) {
      logger.debug(`Using spawn queue to create creep: ${roleNames[creepRole]}`);
      return this.getQueuedCreep(this.room.name, energyCapacityAvailable, creepRole);
    }

    return null;
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
    if (role == Role.HAULER) {
      return getHauler(energyCapacityAvailable, role);
    }
    const body = getBuilderBody(energyCapacityAvailable);

    return {
      build: body,
      name: `${roleNames[role]}-${Game.time}`,
      options: { memory: { role: role, harvesting: false } }
    };
  }
}
