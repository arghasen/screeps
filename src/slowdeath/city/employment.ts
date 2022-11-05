import { Process } from "../../os/process";
import { logger } from "../../utils/logger";

export class Employment extends Process {
  protected className = "employment";
  public main() {
    logger.info(`${this.className}: Starting employment`);
  }
}
