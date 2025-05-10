import { clearDeadCreepsFromMemory, isCreepAlive } from "../utils/screeps-fns";
import { Process } from "../os/process";

import { logger } from "../utils/logger";
import { Claimer } from "./creepActions/claimer";
import { CreepTask, Role } from "./creepActions/constants";
import { Dismantler } from "./creepActions/Dismantler";

/**
 * Empire overlooks the entire empire and takes high level decisions
 */
export class Empire extends Process {
  protected className = "empire";
  public main() {
    logger.info(`${this.className}: Starting Empire`);
    logger.debug(`${this.className}: launching colonies`);
    this.handleFlags();
    for (const room of Object.keys(Game.rooms)) {
      if (room && Game.rooms[room].controller?.my) {
        this.launchChildProcess(`colony-${room}`, "colony", { roomName: room });
      }
    }
    if (Game.time % 100 === 0) {
      clearDeadCreepsFromMemory();
      this.cleanupOldRooms();
    }
  }
  private cleanupOldRooms() {
    const rooms = Memory.rooms;
    for (const room of Object.keys(rooms)) {
      if (!(room in Game.rooms)) {
        delete Memory.rooms[room];
      }
    }
  }

  private handleFlags() {
    const flags = Game.flags;
    for (const name in flags) {
      const flag = flags[name];
      if (name === "claimThisRoom") {
        const creep_ = _.filter(Game.creeps, (creep: Creep) => {
          return creep.memory.role === Role.CLAIMER;
        });
        for (const c of creep_) {
          Claimer.run(c);
        }
        if (!Memory.createClaimer) {
          Memory.createClaimer = {
            loc: {
              x: flag.pos.x,
              y: flag.pos.y,
              roomName: flag.pos.roomName
            },
            identifier: 1
          };
        }
        const creepName = Memory.createClaimer.done;
        if (creepName && !isCreepAlive(creepName)) {
          Memory.createClaimer = {
            loc: {
              x: flag.pos.x,
              y: flag.pos.y,
              roomName: flag.pos.roomName
            },
            identifier: 1
          };
        }
        if (Game.rooms[flag.pos.roomName].controller?.my) {
          flag.remove();
          delete Memory.createClaimer;
        }
      }

      if (name === "Attack") {
        logger.info(`attack needed at location ${String(flag)}`);
        const creep_ = _.filter(Game.creeps, (creep: Creep) => {
          return creep.memory.role === Role.DISMANTLER;
        });
        if (creep_.length < 1) {
          Game.spawns.Spawn1.spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE], "das1", {
            memory: { role: Role.DISMANTLER, task: CreepTask.UNKNOWN, homeRoom: "" }
          });
        }
        for (const c of creep_) {
          Dismantler.run(c);
        }
      }
    }
  }
}
