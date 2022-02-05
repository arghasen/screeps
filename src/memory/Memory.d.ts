interface Memory {
  roadsDone: boolean;
  continuousHarvestingStarted: boolean;
  stats: any;
  version: string;
  energy: number;
  focus: string;
  count: number;
  source:Id<Source>;
  settings:any;
}

interface CreepMemory {
  upgrading?: boolean;
  building?: boolean;
  running?: boolean;
  role: any;
  source?:any;
}
