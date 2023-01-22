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
    this.handleFlags();
    for (const room of Object.keys(Game.rooms)) {
      this.launchChildProcess(`colony-${room}`, "colony", { roomName: room });
    }
    if (Game.time % 100 === 0) {
      clearDeadCreepsFromMemory();
    }
  }

  private handleFlags() {
    const flags = Game.flags;
    for (const name in flags) {
      const flag = flags[name];
      if (name === "claimThisRoom") {
        if(!Memory.createClaimer)
        {
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
      }
    }
  }
}
