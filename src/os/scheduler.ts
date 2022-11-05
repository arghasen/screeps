import { logger } from 'utils/logger';
import { Pid, Process } from './process';
import { processTypes } from './processRegistry';

export class Scheduler {
  memory: Memory;
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

  public launch(name: string, data: object ={}, parent?: Pid ): Pid {
    logger.info(`launching process : ${name} `);
    const pid = this.getNextPid();
    this.memory.processes.index[pid] = {
      n: name, 
      d: data,
      p: parent
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

  public getPriorityForPid(pid: Pid) {}

  public getNextPid(): Pid {
    if (!this.memory.lastPid) {
      this.memory.lastPid = 0;
    }
    return ++this.memory.lastPid;
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
      logger.info(`Creating ${ProgramClass.name} for pid : ${pid}`);
      try {
        this.processCache[pid] = new ProgramClass(
          pid,
          this.memory.processes.index[pid].n,
          this.memory.processes.index[pid].d,
          this.memory.processes.index[pid].p
        );
      } catch (e: any) {
        logger.error(`Scheduler: ${e}`);

        throw new Error('Could not create Process for pid:${pid}');
      }
    }
    return this.processCache[pid];
  }

  private getProgramClass(name: string) {
    logger.info(`Getting program class for : ${name}`);
    return processTypes[name];
  }

  public getCompletedProcessCount(): number {
    return this.memory.processes.completed.length;
  }
}
