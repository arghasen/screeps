import { Process } from "../os/process";
import { logger } from "../utils/logger";

/**
 * Colonies comprise of a city and the dominions of the city.
 */
export class Colony extends Process {
  protected className = "colony";
  private colonyData?: ColonyData;

  public main() {
    this.colonyData = this.data as ColonyData;
    logger.debug(`${this.className}: Starting colony for ${this.colonyData.roomName}`);
    this.launchChildProcess(`city-${this.colonyData.roomName}`, "city", {
      roomName: this.colonyData.roomName
    });
  }
}
