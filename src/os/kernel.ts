import { Scheduler } from "os/scheduler";
import { logger } from "utils/logger";

export class Kernel {
  private scheduler: Scheduler;

  public constructor() {
    global.kernel = this;
    this.scheduler = new Scheduler();
  }

  public start(): void {
    this.scheduler.reschedule();
    if (this.scheduler.getProcessCount() <= 0) {
      this.scheduler.launch("slowDeath");
    }
  }

  public run(): void {
    while (this.continueRunning()) {
      const currentProcessPid = this.scheduler.getNextProcess();

      if (currentProcessPid < 0) {
        logger.info(`exiting kernel run as no process left`);
        return;
      }

      logger.info(`kernel:running process pid: ${currentProcessPid}`);

      const currentProcess = this.scheduler.getProcessForPid(currentProcessPid);
      try {
        currentProcess.run();
      } catch (e: any) {
        logger.error(
          `Kernel: error while running process pid:${currentProcessPid} name:${currentProcess.name} errorType: ${e}" `
        );
      }
    }
  }

  private continueRunning() {
    return true;
  }

  public shutdown(): void {
    const processCount = this.scheduler.getProcessCount();
    const completedCount = this.scheduler.getCompletedProcessCount();
    logger.info(`Processes Run: ${completedCount}/${processCount}`);
  }

  public getScheduler(): Scheduler {
    return this.scheduler;
  }
}
