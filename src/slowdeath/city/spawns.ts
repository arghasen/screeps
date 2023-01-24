import { Process } from "../../os/process";
import { MaxPopulationPerRoom, MaxRolePopulation, Role } from "slowdeath/creepActions/constants";
import { logger } from "../../utils/logger";
import { spawnsInRoom } from "../../utils/screeps-fns";

export class Spawns extends Process {
  protected className = "spawns";
  private metadata?: CityData;
  private room!: Room;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting spawnner`);
    if (!Game.rooms[this.metadata.roomName]) {
      return this.suicide();
    }

    this.room = Game.rooms[this.metadata.roomName];
    if (this.room.controller) {
      const spawns = spawnsInRoom(this.room);
      const roomName = this.room.name;
      const myCreeps = _.filter(Game.creeps, creep => {
        return creep.pos.roomName === roomName;
      });

      if (myCreeps.length >= MaxPopulationPerRoom[this.room.controller.level] + MaxRolePopulation.continuousHarvester && !this.room.memory.createContinuousHarvester) {
        return;
      }
      for (const spawn of spawns) {
        if (spawn.spawning) {
          continue;
        }
        const creep = getQueuedCreep(
          this.room.name,
          this.room.energyAvailable,
          this.room.energyCapacityAvailable
        );
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

function getQueuedCreep(
  roomName: string,
  energyAvailable: number,
  energyCapacityAvailable: number
) {
  const room = Game.rooms[roomName];
  if (room.memory.critical) {
    return {
      build: [WORK, CARRY, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { harvesting: false } }
    };
  }

  if (room.memory.createContinuousHarvester) {
    if (energyCapacityAvailable > 1000) {
      return {
        build: [WORK, WORK, WORK, WORK, WORK,CARRY, MOVE],
        name: `creep-${Game.time}`,
        options: { memory: { role: Role.ROLE_CONTINUOUS_HARVESTER, harvesting: false } }
      };
    }
    return {
      build: [WORK, WORK, WORK, WORK, WORK, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { role: Role.ROLE_CONTINUOUS_HARVESTER, harvesting: false } }
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
            moveLoc: Memory.createClaimer.loc,
            identifier: Memory.createClaimer.identifier,
            harvesting: false
          }
        }
      };
    }
  }

  if (energyCapacityAvailable > 400 && energyCapacityAvailable <= 600) {
    return {
      build: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { harvesting: false } }
    };
  } else if (energyCapacityAvailable > 600 && energyCapacityAvailable < 1000) {
    return {
      build: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { harvesting: false } }
    };
  } else if (energyCapacityAvailable > 1100) {
    return {
      build: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { harvesting: false } }
    };
  }
  else {
    return {
      build: [WORK, CARRY, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { harvesting: false } }
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
