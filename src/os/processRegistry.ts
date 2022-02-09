import {Slowdeath} from "programs/slowdeath"
import {City} from "slowDeath/city"
import { Empire } from "slowdeath/empire"
import { Colony} from "slowDeath/colony"
import {Infrastructure } from "slowDeath/infrastructure"
import {Dominion} from "slowDeath/dominion"
import { Employment } from "slowDeath/employment"
import {Military} from "slowDeath/military"

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