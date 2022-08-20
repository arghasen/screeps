import { Process, Pid } from 'os/process';
import { logger } from 'utils/logger';
import { Slowdeath } from 'old/SlowDeath';

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

    // TODO: this should be the way to do this
    // const spawns = this.findSpawnsInRoom(this.room);
    // const creep: CreepDef = {
    //   body: [WORK, CARRY, MOVE],
    //   name: 'creep' + Game.time,
    //   memory: { role: 'harvester' }
    // };
    // this.createCreep(spawns, creep);

    Slowdeath.init();
    Slowdeath.execute();
  }

  private findSpawnsInRoom(room: Room) {
    const maxspawns =
      CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][room.controller!.level];
    const spawns = this.room.find(FIND_MY_SPAWNS, {
      filter: (s: any, i: any, c: any) => c.length <= maxspawns || s.isActive()
    });
    return spawns;
  }

  private createCreep(spawns: StructureSpawn[], creep: CreepDef) {
    if (!creep) {
      return;
    }
    for (let spawn of spawns) {
      if (spawn.spawning) {
        continue;
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
