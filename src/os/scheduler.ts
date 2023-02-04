import { NOT_RUNNING, Pid, Process } from "./process";
import { RunnableProcess, processTypes } from "./processRegistry";
import { logger } from "utils/logger";

export class Scheduler {
  private memory: SchedulerMemory;
  private processCache: Record<Pid, Process>;

  public constructor() {
    this.memory = Memory.os.scheduler;
    this.processCache = {};
  }

  public getNextProcess(): Pid {
    if (this.memory.processes.running !== NOT_RUNNING) {
      this.memory.processes.completed.push(this.memory.processes.running);
      this.memory.processes.running = NOT_RUNNING;
    }
    // logger.debug(logger.printObject(this.memory))
    const nextProcess: Pid | undefined = this.memory.processes.ready.shift();
    if (nextProcess) {
      this.memory.processes.running = nextProcess;
      return this.memory.processes.running;
    }
    if (this.memory.processes.ready.length === 0) {
      return -1;
    }
    return -1;
  }

  public launch(name: string, data: unknown = {}, parent?: Pid): Pid {
    logger.debug(`launching process : ${name} `);
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
      this.memory.processes.running = NOT_RUNNING;
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
      const ProgramClass = this.getProgramClass(this.memory.processes.index[pid].n);
      logger.debug(`Creating ${ProgramClass.name} for pid : ${pid}`);
      try {
        this.processCache[pid] = this.getProgram(ProgramClass, pid);
      } catch (e) {
        logger.error(`Scheduler: ${(e as Error).message}`);

        throw new Error("Could not create Process for pid:${pid}");
      }
    }
    return this.processCache[pid];
  }

  private getProgram(programClass: RunnableProcess<Process>, pid: Pid) {
    return new programClass(
      pid,
      this.memory.processes.index[pid].n,
      this.memory.processes.index[pid].d,
      this.memory.processes.index[pid].p
    );
  }
  private getProgramClass(name: string) {
    logger.debug(`Getting program class for : ${name}`);
    return processTypes[name];
  }

  public getCompletedProcessCount(): number {
    return this.memory.processes.completed.length;
  }

  public kill(pid: Pid) {
    if (this.memory.processes.index[pid]) {
      // Process needs to be woken up first
      // this.wake(pid)
      delete this.memory.processes.index[pid];
    }
  }
}
