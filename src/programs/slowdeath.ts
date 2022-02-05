import { Pid, Process } from 'os/process';
import { logger } from 'utils/logger';

export class Slowdeath extends Process {
  className: string = 'slowDeath';
  constructor(pid: Pid, name: string, data: any) {
    super(pid, name, data);
  }

  public main() {
    logger.info(`${this.className}: starting main`);
  }
}
