import { logger } from 'utils/logger';
import { Pid, Process } from './process';
import { processTypes } from './processRegistry';

export class Scheduler {
  memory: any;
  processCache: any;
  constructor() {
    if (!Memory.os.scheduler) {
      Memory.os.scheduler = {};
    }
    this.memory = Memory.os.scheduler;
    this.processCache = {};

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

  public reschedule() {
    // Add processes that did run back into the system, including any "running" scripts that never completed
    if (this.memory.processes.running) {
      this.memory.processes.completed.push(this.memory.processes.running);
      this.memory.processes.running = false;
    }
    for (const pid of this.memory.processes.completed) {
      // If process is dead do not merge it back into the queue system.
      if (!this.memory.processes.index[pid]) {
        continue;
      }
      this.memory.processes.ready.push(pid);
    }
    this.memory.processes.completed = [];
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

  public getProcessForPid(pid: Pid): Process {
    if (!this.processCache[pid]) {
      const ProgramClass = this.getProgramClass(
        this.memory.processes.index[pid].n
      );
      logger.info(
        `Creating ${ProgramClass} for pid : ${this.memory.processes.index[pid].n}`
      );
      try {
        this.processCache[pid] = new ProgramClass(
          pid,
          this.memory.processes.index[pid].n,
          this.memory.processes.index[pid].d,
          this.memory.processes.index[pid].p
        );
      } catch (e: any) {
        logger.error(`Scheduler: ${logger.printObject(e)}`);

        throw new Error('Could not create Proces for pid:${pid}');
      }
    }
    return this.processCache[pid];
  }
  private getProgramClass(name: string) {
    return processTypes[name];
  }

  public getCompletedProcessCount(): number {
    return this.memory.processes.completed.length;
  }
}
