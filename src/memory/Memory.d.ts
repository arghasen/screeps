interface Memory {
  stats: any;
  version: string;
  energy: number;
}

interface CreepMemory {
  upgrading?: boolean;
  building?: boolean;
  role: any;
}
