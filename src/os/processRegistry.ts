import { City } from "slowdeath/city";
import { Colony } from "slowdeath/colony";
import { Dominion } from "slowdeath/dominion";
import { Empire } from "slowdeath/empire";
import { Employment } from "slowdeath/employment";
import { Infrastructure } from "slowdeath/infrastructure";
import { Military } from "slowdeath/military";
import { Process } from "os/process";
import { Slowdeath } from "slowdeath/slowdeath";

export const processTypes: { [key: string]: typeof Process } = {
  slowDeath: Slowdeath,
  empire: Empire,
  colony: Colony,
  city: City,
  dominions: Dominion,
  infrastructure: Infrastructure,
  employment: Employment,
  military: Military
};

export const ai = processTypes.slowdeath;
