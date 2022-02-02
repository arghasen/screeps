interface Memory {
  continuousHarvestingStarted: boolean;
  stats: any;
  version: string;
  energy: number;
}

interface CreepMemory {
  upgrading?: boolean;
  building?: boolean;
  running?: boolean;
  role: any;
}
