interface Memory {
  [x: string]: any;
  roadsDone: boolean;
  continuousHarvestingStarted: boolean;
  stats: any;
  version: string;
  energy: number;
  focus: string;
  count: number;
  source: Id<Source>;
  settings: any;
}

interface CreepMemory {
  upgrading?: boolean;
  building?: boolean;
  running?: boolean;
  role?: any; //FIXME
  source?: any;
}

interface CreepDef {
  body: BodyPartConstant[];
  memory: CreepMemory;
  name: string;
}
