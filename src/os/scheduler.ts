import { logger } from 'utils/logger';
import { Pid, Process } from './process';

export class Scheduler {


  memory: any;
  constructor() {
    if (!Memory.os.scheduler) {
      Memory.os.scheduler = {};
    }
    this.memory = Memory.os.scheduler;
    if (!this.memory.processes) {
      logger.debug('No scheduler process memory found, recreating');
      this.memory.processes = {
        running: false,
        ready: [],
        completed: [],
        waiting: [],
        sleeping: [],
        index: {},
        count: 0
      };
    }
  }
  public getNextProcess(): Pid {
    if (this.memory.processes.running) {
      this.memory.processes.completed.push(this.memory.processes.running);
      this.memory.processes.running = false;
    }
    //logger.debug(logger.printObject(this.memory))
    const nextProcess = this.memory.processes.ready.shift();
    if (nextProcess) {
      this.memory.processes.running = nextProcess;
      return this.memory.processes.running;
    }
    if (this.memory.processes.ready.length === 0) {
      return -1;
    }
    return -1;
  }

  public launch(name: string): Pid {
    const pid = this.getNextPid();
    this.memory.processes.index[pid] = {
      n: name
    };

    this.memory.processes.ready.push(pid);
    return pid;
  }

  reschedule() {
    throw new Error('Method not implemented.');
  }
  public getPriorityForPid(pid: void) {}

  public getNextPid(): Pid {
    if (!this.memory.lastPid) {
      this.memory.lastPid = 0;
    }
    return this.memory.lastPid++;
  }

  public getProcessCount(): number {
    return Object.keys(this.memory.processes.index).length;
  }

  private isPidActive(pid: Pid): boolean {
    return !!this.memory.processes.index[pid];
  }

  public getProcessForPid(): Process {
    throw new Error('Method not implemented.');
  }

  public getCompletedProcessCount(): number {
    return this.memory.processes.completed.length;
  }
}
