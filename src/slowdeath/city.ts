import { Process } from "os/process";
import { logger } from "utils/logger";

/**
 * City is the lowest level of an empire and is responsible for individual cities
 */
export class City extends Process {
  protected className = "city";
  public main() {
    logger.info(`${this.className}: Starting city for ${this.data.roomName}`);
    this.launchChildProcess(`infrastructure-${this.data.roomName}`, "infrastructure", {});
  }
}
