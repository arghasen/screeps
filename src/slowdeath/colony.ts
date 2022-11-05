import { Process } from "os/process";
import { logger } from "utils/logger";

/**
 * Colonies comprise of a city and the dominions of the city.
 */
export class Colony extends Process {
  protected className = "colony";
  private colonyData: object = {};

  public main() {
    logger.info(`${this.className}: Starting colony`);
  }
}
