import {Slowdeath} from "slowdeath/slowdeath"
import {City} from "slowdeath/city"
import { Empire } from "slowdeath/empire"
import { Colony} from "slowdeath/colony"
import {Infrastructure } from "slowdeath/infrastructure"
import {Dominion} from "slowdeath/dominion"
import { Employment } from "slowdeath/employment"
import {Military} from "slowdeath/military"

export const processTypes:{[key:string]:any} = {
    "slowDeath":Slowdeath,
    "empire": Empire,
    "colony": Colony,
    "city": City,
    "dominions": Dominion,
    "infrastructure": Infrastructure,
    "employment": Employment,
    "military": Military
}

export var ai = processTypes.slowdeath;
