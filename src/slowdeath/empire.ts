import { Process } from "../os/process";
import { clearDeadCreepsFromMemory } from "../utils/screeps-fns";
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
        Memory.createClaimer = {
          x: flag.pos.x,
          y: flag.pos.y,
          targetRoom: flag.pos.roomName
        };
      }
    }
    if (Game.time % 100 === 0) {
      clearDeadCreepsFromMemory();
    }
  }
}
