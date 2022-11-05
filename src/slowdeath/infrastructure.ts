import { Process } from "../os/process";
import { logger } from "../utils/logger";

export class Infrastructure extends Process {
  protected className = "infrastructure";
  public main() {
    logger.info(`${this.className}: Starting infrastructure`);
  }
}
