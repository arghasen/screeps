import { clearDeadCreepsFromMemory, isCreepAlive } from "../utils/screeps-fns";
import { Process } from "../os/process";

import { logger } from "../utils/logger";

/**
 * Empire overlooks the entire empire and takes high level decisions
 */
export class Empire extends Process {
  protected className = "empire";
  public main() {
    logger.info(`${this.className}: Starting Empire`);
    logger.info(`${this.className}: launching colonies`);
    for (const room of Object.keys(Game.rooms)) {
      console.log(room);
      this.launchChildProcess(`colony-${room}`, "colony", { roomName: room });
    }
    const flags = Game.flags;
    for (const name in flags) {
      const flag = flags[name];
      if (name === "claimThisRoom") {
        const creepName = Memory.createClaimer.done;
        if (creepName && !isCreepAlive(creepName)) {
          Memory.createClaimer = {
            x: flag.pos.x,
            y: flag.pos.y,
            targetRoom: flag.pos.roomName,
            identifier: 1
          };
        }
      }
    }
    if (Game.time % 100 === 0) {
      clearDeadCreepsFromMemory();
    }
  }
}
