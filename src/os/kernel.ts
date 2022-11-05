import { logger } from 'utils/logger';
import { Scheduler } from 'os/scheduler';

export class Kernel {
  scheduler: Scheduler;
  
  constructor() {
    global.kernel = this;
    if(!Memory.os)
    {
        Memory.os = {}
    }
    this.scheduler = new Scheduler();
  }

  start(): void {
      this.scheduler.reschedule();
    if (this.scheduler.getProcessCount() <= 0) {

      this.scheduler.launch('slowDeath');
    }
  }

  run(): void {
    while (this.continueRunning()) {
      const currentProcessPid = this.scheduler.getNextProcess();

      if (currentProcessPid <0) {
        logger.info(`exiting kernel run as no process left`);
        return;
      }

      logger.info(
        `kernel:running process pid: ${currentProcessPid}`
      );

      const currentProcess = this.scheduler.getProcessForPid(currentProcessPid);
      try{
      currentProcess.run();
      }
      catch(e: any)
      {
        logger.error(`Kernel: error while running process pid:${currentProcessPid} name:${currentProcess.name} errorType: ${e}" `)
      }
    }
  }

  private continueRunning() {
    return true;
  }

  shutdown(): void {
    const processCount = this.scheduler.getProcessCount();
    const completedCount = this.scheduler.getCompletedProcessCount();
    logger.info(`Processes Run: ${completedCount}/${processCount}`);
  }

}
