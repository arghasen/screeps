import {
  build,
  findStructureNeedingRepair,
  getEnergy,
  moveToOtherRoom,
  repair,
  transferEnergyFromCreep
} from "../../slowdeath/creepActions/CommonActions";
import { setCreepState } from "./creepState";

export class Builder {
  public static run = (creep: Creep): void => {
    setCreepState(creep);

    if (!creep.memory.harvesting) {
      if (creep.memory.moveLoc) {
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
