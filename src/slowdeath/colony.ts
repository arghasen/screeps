import { Process, Pid } from 'os/process';
import { logger } from 'utils/logger';

/**
 * Colonies comprise of a city and the dominions of the city.
 */
export class Colony extends Process {
  className: string = 'colony';
  room: Room;
  constructor(pid: Pid, name: string, data: { [key: string]: any }) {
    super(pid, name, data);
    this.room = Game.rooms[this.data.room];
  }
  public main() {
    logger.info(`${this.className}: Starting colony`);
    if (!this.room || !this.room.controller) {
      return; //this.suicide()
    }

    const maxspawns =
      CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][this.room.controller.level];
    const spawns = this.room.find(FIND_MY_SPAWNS, {
      filter: (s:any, i:any, c:any) => c.length <= maxspawns || s.isActive()
    });

    for (let spawn of spawns) {
      if (spawn.spawning) {
        continue;
      }
      const creep: CreepDef = {
        body: [WORK, CARRY, MOVE],
        name: 'creep'+ Game.time,
        memory: {}
      };
      if (!creep) {
        break;
      }
      const ret = spawn.spawnCreep(creep.body, creep.name);
      if (Number.isInteger(ret)) {
        logger.error(
          `Error ${ret} while spawning creep ${creep.name} in room ${this.room}`
        );
      } else {
        logger.info(`Spawning creep ${creep.name} from ${this.room}`);
      }
    }
  }
}
