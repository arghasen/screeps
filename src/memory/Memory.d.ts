type ScreepsPrometheus = import("@brainwart/screeps-prometheus-game").ScreepsPrometheus;
type PromDict = ReturnType<ScreepsPrometheus["build"]>;

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
  roadsDone: number;
  continuousHarvestingStarted: boolean;
  stats: PromDict;
  version: string;
  energy: number;
  focus: string;
  count: number;
  source: Id<Source>;
  settings: {
    log: {
      level: import("utils/logger").LogLevels;
      showTick: boolean;
    };
  };
  os: {
    scheduler: SchedulerMemory;
  };
  continuousHarvesterCount: number;
  createContinuousHarvester: boolean;
}
interface CreepMemory {
  upgrading?: boolean;
  building?: boolean;
  running?: boolean;
  role?: any;
  source?: any;
}

interface ProcessData {
  children?: Record<string, Pid>;
}

interface ColonyData extends ProcessData {
  roomName: string;
}

interface CityData extends ProcessData {
  roomName: string;
}
