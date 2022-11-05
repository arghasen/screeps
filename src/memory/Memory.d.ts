interface Stats {
  roomSummary?: any;
}
type Pid = import("os/process").Pid;
interface SchedulerMemory {
  processes: {
    running: Pid;
    ready: Pid[];
    completed: Pid[];
    waiting: Pid[];
    sleeping: Pid[];
    index: {
      [x: Pid]: {
        n: string;
        d: unknown;
        p?: Pid;
      };
    };
    count: number;
  };
  lastPid?: Pid;
}

interface Memory {
  [x: string]: any;
  roadsDone: boolean;
  continuousHarvestingStarted: boolean;
  stats: Stats;
  version: string;
  energy: number;
  focus: string;
  count: number;
  source: Id<Source>;
  settings: any;
  os: {
    scheduler: SchedulerMemory;
  };
}
interface CreepMemory {
  upgrading?: boolean;
  building?: boolean;
  running?: boolean;
  role: any;
  source?: any;
}

interface ProcessData {
  children?: Record<string, Pid>;
}
