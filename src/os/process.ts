export type Pid = number;
export const NOT_RUNNING = -1;

export abstract class Process {
  private pid: number;
  private name: string;
  protected data: ProcessData;
  protected parent?: Pid;
  protected className = "Process";

  public constructor(pid: Pid, name: string, data: ProcessData = {}, parent?: Pid) {
    this.pid = pid;
    this.name = name;
    this.data = data;
    this.parent = parent;
  }

  public launchChildProcess(tag: string, name: string, data: unknown = {}) {
    if (!this.data.children) {
      this.data.children = {};
    }
    if (this.data.children[tag]) {
      return true;
    }
    this.data.children[tag] = global.kernel.getScheduler().launch(name, data, this.pid);
    return this.data.children[tag];
  }

  public abstract main(): void;

  public run(): void {
    this.main();
  }

  public getName() {
    return this.className;
  }
}
