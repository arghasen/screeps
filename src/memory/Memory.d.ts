interface Memory {
  continuousHarvestingStarted: boolean;
  stats: any;
  version: string;
  energy: number;
  focus: string;
  count: number;
  source:Id<Source>
}

interface CreepMemory {
  upgrading?: boolean;
  building?: boolean;
  running?: boolean;
  role: any;
  source?:any;
}
