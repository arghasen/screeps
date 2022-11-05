interface Stats{

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
