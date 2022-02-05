export type Pid = number;
export abstract class Process {
  pid: number;
  name: string;
  data: any;
  parent?: Process;
  constructor(pid: Pid, name: string, data: any, parent?: Process) {
    this.pid = pid;
    this.name = name;
    this.data = data;
    this.parent = parent;
  }

  abstract main():void;
  public run(): void {
    this.main();
  }
}
