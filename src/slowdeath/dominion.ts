import { Process } from "os/process";
import { logger } from "utils/logger";

export class Dominion extends Process {
  protected className = "dominion";
  public main() {
    logger.info(`${this.className}: Starting dominion`);
  }
}
