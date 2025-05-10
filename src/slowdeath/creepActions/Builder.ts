import {
  build,
  findStructureNeedingRepair,
  getEnergy,
  moveToOtherRoom,
  repair,
  transferEnergyFromCreep,
} from "../../slowdeath/creepActions/CommonActions";
import { CreepTask } from "./constants";
import { Actor } from "./Actor";
import { logger } from "utils/logger";

export class Builder extends Actor {
  public static run = (creep: Creep): void => {
    super.setTask(creep);
    if (creep.memory.task == CreepTask.RENEW) {
      super.renewCreep(creep);
    } else if (creep.memory.task != CreepTask.HARVEST) {
      if (creep.memory.moveLoc) {
        logger.info(`builder ${creep.name} moving to ${creep.memory.moveLoc}`);
        moveToOtherRoom(creep, creep.memory.moveLoc);
      } else {
        const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target) {
          build(creep, target);
        } else {
          const targetStructure = findStructureNeedingRepair(creep.room, creep.pos);
          if (targetStructure) {
            repair(creep, targetStructure);
          } else {
            transferEnergyFromCreep(creep);
          }
        }
      }
    } else {
      getEnergy(creep);
    }
  };
}
