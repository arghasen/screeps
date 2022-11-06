import { Role } from "slowdeath/creepActions/constants";
import { Process } from "../../os/process";
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

      for (const spawn of spawns) {
        if (spawn.spawning) {
          continue;
        }
        const creep = getQueuedCreep();
        if (!creep) {
          break;
        }
        if (getSpawnCost(creep.build) <= this.room.energyAvailable) {
          const ret = spawn.spawnCreep(creep.build, creep.name, creep.options);
          if (Number.isInteger(ret)) {
            logger.error(
              `${ret} while spawning creep ${creep.name} in room ${this.metadata.roomName}`
            );
          } else {
            logger.info(`Spawning creep ${creep.name} from ${this.metadata.roomName}`);
          }
        }
      }
    }
  }
}

function getQueuedCreep() {
  if (Memory.createContinuousHarvestor) {
    return {
      build: [WORK, WORK, WORK, WORK, WORK, MOVE],
      name: `creep-${Game.time}`,
      options: { memory: { role: Role.ROLE_CONTINUOUS_HARVESTER } }
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
