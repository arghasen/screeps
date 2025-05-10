type ScreepsPrometheus = import("@brainwart/screeps-prometheus-game").ScreepsPrometheus;
type PromDict = ReturnType<ScreepsPrometheus["build"]>;

type Pid = import("os/process").Pid;
type Role = import("slowdeath/creepActions/constants").Role;

interface CreepSpawnData {
  build: BodyPartConstant[];
  name: string;
  options: SpawnOptions;
}

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
  spawnNext?: CreepSpawnData;
  rcl: Record<number, number>;
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
  remoteMining: {
    creepCost: number;
    energyHarvested: number;
    energyTransferred: number;
    rooms: string[];
  };
  mineMinerals: boolean;
  energyContainers: Id<StructureContainer>[];
  enemy: boolean;
}

interface Memory {
  gcl: Record<GlobalControlLevel["level"], number>;
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
  createClaimer?: {
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
  target?: Id<_HasId>;
  link?: Id<StructureLink>;
  identifier?: number;
  targetRoom?: string;
  task: import("slowdeath/creepActions/constants").CreepTask;
  role: number;
  source?: Id<Source>;
  moveLoc?: MoveLoc;
  homeRoom: string;
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
