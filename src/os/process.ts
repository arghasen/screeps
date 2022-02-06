export type Pid = number;
export abstract class Process {
  pid: number;
  name: string;
  data: any;
  parent?: Process;
  className: string = 'Process';
  constructor(pid: Pid, name: string, data: any, parent?: Process) {
    this.pid = pid;
    this.name = name;
    this.data = data;
    this.parent = parent;
  }
  launchChildProcess (tag:string, name:string, data = {}) {
    if (!this.data.children) {
      this.data.children = {}
    }
    if (this.data.children[tag]) {
      return true
    }
    this.data.children[tag] = global.kernel.scheduler.launchProcess(name, data, this.pid)
    return this.data.children[tag]
  }
  abstract main():void;
  public run(): void {
    this.main();
  }
}
