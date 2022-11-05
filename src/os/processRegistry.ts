import { Pid, Process } from "./process";
import { City } from "../slowdeath/city";
import { Colony } from "../slowdeath/colony";
import { Dominion } from "../slowdeath/dominion";
import { Empire } from "../slowdeath/empire";
import { Employment } from "../slowdeath/city/employment";
import { Infrastructure } from "../slowdeath/city/infrastructure";
import { Military } from "../slowdeath/city/military";
import { Slowdeath } from "../slowdeath/slowdeath";
import { Spawns } from "../slowdeath/city/spawns";

export interface RunnableProcess<T extends Process> {
  new (pid: Pid, name: string, data: any, parent?: Pid): T;
}

export const processTypes: { [key: string]: RunnableProcess<Process> } = {
  slowDeath: Slowdeath,
  empire: Empire,
  colony: Colony,
  city: City,
  dominions: Dominion,
  infrastructure: Infrastructure,
  employment: Employment,
  military: Military,
  spawns: Spawns
};

export const ai = processTypes.slowdeath;
