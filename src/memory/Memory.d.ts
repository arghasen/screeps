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
interface MoveLoc {
  x: number;
  y: number;
  roomName: string;
}
interface RoomMemory {
  upgraderLink: Id<StructureController> | Id<StructureExtension> | Id<StructureExtractor> | Id<StructureFactory> | Id<StructureInvaderCore> | Id<StructureKeeperLair> | Id<StructureLab> | Id<StructureLink> | Id<StructureNuker> | Id<StructureObserver> | Id<StructurePowerBank> | Id<StructurePowerSpawn> | Id<StructureRampart> | Id<StructureSpawn> | Id<StructureStorage> | Id<StructureTerminal> | Id<StructureTower> | undefined;
  setup: any;
  roadsDone: number;
  continuousHarvestingStarted: boolean;
  continuousHarvesterCount: number;
  createContinuousHarvester: boolean;
  critical: boolean;
  linksCreated : boolean;
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
  link?: Id<StructureController> | Id<StructureExtension> | Id<StructureExtractor> | Id<StructureFactory> | Id<StructureInvaderCore> | Id<StructureKeeperLair> | Id<StructureLab> | Id<StructureLink> | Id<StructureNuker> | Id<StructureObserver> | Id<StructurePowerBank> | Id<StructurePowerSpawn> | Id<StructureRampart> | Id<StructureSpawn> | Id<StructureStorage> | Id<StructureTerminal> | Id<StructureTower>;
  identifier?: number;
  targetRoom?: string;
  harvesting: boolean;
  role?: number;
  source?: any;
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
