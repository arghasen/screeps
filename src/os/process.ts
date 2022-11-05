export type Pid = number;

export abstract class Process {
  private pid: number;
  private name: string;
  protected data: any;
  protected parent?: Process;
  protected className = "Process";

  public constructor(pid: Pid, name: string, data = {}, parent?: Process) {
    this.pid = pid;
    this.name = name;
    this.data = data;
    this.parent = parent;
  }

  public launchChildProcess(tag: string, name: string, data = {}) {
    if (!this.data.children) {
      this.data.children = {};
    }
    if (this.data.children[tag]) {
      return true;
    }
    this.data.children[tag] = global.kernel.scheduler.launch(name, data, this.pid)
    return this.data.children[tag];
  }

  public abstract main(): void;

  public run(): void {
    this.main();
  }
}
