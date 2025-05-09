import { logger } from "utils/logger";
import { CreepTask } from "./constants";
import { harvest } from "./CommonActions";

export class MineralMiner {
    public static run = (creep: Creep): void => {
        const source = creep.pos.findClosestByRange(FIND_MINERALS);
        if (source) {
            if (creep.memory.task == CreepTask.RENEW) {
                renewCreep(creep);
            } else if (creep.ticksToLive && creep.ticksToLive > 150) {
                if (creep.store.getFreeCapacity() > 0) {
                    harvest(creep, source);
                } else {
                    storeMinerals(creep);
                }
            } else if (creep.store.getUsedCapacity() > 0) {
                storeMinerals(creep);
            } else {
                creep.memory.task = CreepTask.RENEW;
            }
        } else {
            logger.info(`Mineral miner ${creep.name} has no source`);
        }
    };
}

function renewCreep(creep: Creep) {
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    if (!creep.pos.inRangeTo(spawn, 1)) {
        creep.moveTo(spawn, { visualizePathStyle: { stroke: "#ffaa00" } });
    } else {
        const ret = spawn.renewCreep(creep);
        if (ret == ERR_FULL || ret == ERR_NOT_ENOUGH_ENERGY || ret == ERR_RCL_NOT_ENOUGH) {
            creep.memory.task = CreepTask.HARVEST;
        }
    }
}

function storeMinerals(creep: Creep) {
    const structures = creep.room.find(FIND_STRUCTURES);
    const target = structures.find(structure => structure.structureType === STRUCTURE_STORAGE);
    if (target) {
        if (creep.pos.inRangeTo(target, 1)) {
            for (const resourceType of Object.keys(creep.store)) {
                if (creep.store.getUsedCapacity(resourceType as ResourceConstant) > 0) {
                    creep.transfer(target, resourceType as ResourceConstant);
                }
            }
        } else {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
    }
}
