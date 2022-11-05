import { Pid, Process } from "../os/process";
import { logger } from "../utils/logger";

/**
 *  Top level AI module that launches all processes.
 */
export class Slowdeath extends Process {
  protected className = "slowDeath";

  public constructor(pid: Pid, name: string, data: ProcessData) {
    super(pid, name, data);
  }

  public main() {
    logger.info(`${this.className}: starting main`);
    logger.info(`${this.className}: launching empire`);
    this.launchChildProcess("empire", "empire", {});
  }
}
