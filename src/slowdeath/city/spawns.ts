import { Process } from "../../os/process";
import { Role } from "slowdeath/creepActions/constants";
import { logger } from "../../utils/logger";
import { spawnsInRoom } from "../../utils/screeps-fns";

export class Spawns extends Process {
  protected className = "spawns";
  private metadata?: CityData;
  private room?: Room;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting spawnner`);
    if (!Game.rooms[this.metadata.roomName]) {
      return this.suicide();
    }

    this.room = Game.rooms[this.metadata.roomName];
    if (this.room.controller) {
      const spawns = spawnsInRoom(this.room);

      const myCreeps = Object.keys(Game.creeps);
      if (myCreeps.length >= 22 && !Memory.createContinuousHarvester) {
        return;
      }
      for (const spawn of spawns) {
        if (spawn.spawning) {
          continue;
        }
        const creep = getQueuedCreep(this.room.energyAvailable, this.room.energyCapacityAvailable);
        if (!creep) {
          break;
        }
        logger.info(`got creep to create: ${logger.json(creep)}`);
        if (getSpawnCost(creep.build) <= this.room.energyAvailable) {
          const ret = spawn.spawnCreep(creep.build, creep.name, creep.options);
          if (ret !== OK) {
            logger.error(
              `${ret} while spawning creep ${creep.name} in room ${this.metadata.roomName}`
            );
          } else {
            logger.info(`Spawning creep ${creep.name} from ${this.metadata.roomName}`);
            Memory.createClaimer.done = creep.name;
          }
        }
      }
    }
  }
}

function getQueuedCreep(energyAvailable: number, energyCapacityAvailable: number) {
  if (Memory.critical) {
    return {
      build: [WORK, CARRY, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: {} }
    };
  }

  if (Memory.createContinuousHarvester) {
    return {
      build: [WORK, WORK, WORK, WORK, WORK, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { role: Role.ROLE_CONTINUOUS_HARVESTER } }
    };
  }

  if (Memory.createClaimer?.done) {
    if (energyCapacityAvailable >= 800) {
      return {
        build: [CLAIM, MOVE, MOVE, MOVE, MOVE],
        name: `creep-${Game.time}`,
        options: {
          memory: {
            role: Role.ROLE_CLAIMER,
            x: Memory.createClaimer.x,
            y: Memory.createClaimer.y,
            targetRoom: Memory.createClaimer.targetRoom,
            identifier: Memory.createClaimer.identifier
          }
        }
      };
    }
  }

  if (energyCapacityAvailable > 400 && energyCapacityAvailable <= 600) {
    return {
      build: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: {} }
    };
  } else if (energyCapacityAvailable > 600 && energyCapacityAvailable <= 800) {
    return {
      build: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: {} }
    };
  } else {
    return {
      build: [WORK, CARRY, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: {} }
    };
  }
}

function getSpawnCost(body: BodyPartConstant[]) {
  let cost = 0;
  for (const part of body) {
    cost += BODYPART_COST[part];
  }
  return cost;
}
