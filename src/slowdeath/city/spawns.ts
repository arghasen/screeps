import { Process } from "../../os/process";
import { Role } from "../creepActions/constants";
import { logger } from "../../utils/logger";

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
      const maxspawns = CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][this.room.controller.level];
      const spawns = this.room.find(FIND_MY_SPAWNS, {
        filter: (s: AnyStructure, i: number, c: AnyStructure[]) =>
          c.length <= maxspawns || s.isActive()
      });

      for (const spawn of spawns) {
        if (spawn.spawning) {
          continue;
        }
        const creep = getQueuedCreep();
        if (!creep) {
          break;
        }
        const ret = spawn.spawnCreep(creep.build, creep.name, creep.memory);
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

function getQueuedCreep() {
  return {
    build: [WORK, CARRY, MOVE],
    name: `creep-${Game.time}`,
    memory: { memory: { role: Role.ROLE_UPGRADER } }
  };
}
