import { build, findStructureNeedingRepair, getEnergy, repair, transfer, transferEnergyFromCreep } from "../../slowdeath/creepActions/CommonActions";
import { logger } from "utils/logger";
import { setCreepState } from "./creepState";

export class Builder {
  public static run = (creep: Creep): void => {
    setCreepState(creep);

    if (!creep.memory.harvesting) {
      if (creep.memory.moveLoc) {
        const target = new RoomPosition(creep.memory.moveLoc.x, creep.memory.moveLoc.y, creep.memory.moveLoc.roomName);
        logger.info("Moving.location", logger.json(target));
        creep.moveTo(target);

        if (creep.memory.moveLoc.roomName === creep.pos.roomName) {
          delete creep.memory.moveLoc;
        }
      } else {
        const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target) {
          build(creep, target)
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
