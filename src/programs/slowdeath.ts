import { Pid, Process } from 'os/process';
import { logger } from 'utils/logger';

/**
 *  Top level AI module that launches all processes.
 */
export class Slowdeath extends Process {
  className: string = 'slowDeath';
  constructor(pid: Pid, name: string, data: object) {
    super(pid, name, data);
  }

  public main() {
    logger.info(`${this.className}: starting main`);
    logger.info(`${this.className}: launching empire`);
    this.launchChildProcess("empire","empire",{});
    
  }
}
