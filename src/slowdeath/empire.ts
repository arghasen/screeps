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
      this.launchChildProcess(`colony-${room}`, "colony", { roomName: room });
    }
  }
}
