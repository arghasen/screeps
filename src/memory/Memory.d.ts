type ScreepsPrometheus = import("@brainwart/screeps-prometheus-game").ScreepsPrometheus;
type PromDict = ReturnType<ScreepsPrometheus["build"]>;

type Pid = import("os/process").Pid;
type Role = import ("slowdeath/creepActions/constants").Role ;
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
interface MoveLoc {
  x: number;
  y: number;
  roomName: string;
}
interface RoomMemory {
  spawnQueue: Role[];
  extraBuilders: boolean;
  upgraderLink: Id<StructureLink> | undefined;
  setup: any;
  roadsDone: number;
  continuousHarvestingStarted: boolean;
  continuousHarvesterCount: number;
  createContinuousHarvester: boolean;
  critical: boolean;
  linksCreated: boolean;
  harvesterStartTime: Record<string, number[]>;
}

interface Memory {
  rooms: Record<string, RoomMemory>;
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
  createClaimer: {
    done?: string;
    loc: MoveLoc;
    identifier: number;
  };
  needBuilder: {
    sent: string;
    moveLoc: MoveLoc;
  };
}
interface CreepMemory {
  harvestStartTime?: number;
  target?: any;
  link?: Id<StructureLink>;
  identifier?: number;
  targetRoom?: string;
  harvesting: boolean;
  role?: number;
  source?: Id<Source>;
  moveLoc?: MoveLoc;
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
