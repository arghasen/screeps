import { getEnergy } from "./CommonActions";
import { setCreepState } from "./creepState";

export class Upgrader {
  public static run = (creep: Creep): void => {
    setCreepState(creep);

    if (!creep.memory.harvesting && creep.room.controller !== undefined) {
      if (
        creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE &&
        creep.fatigue === 0
      ) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    } else {
      getEnergy(creep);
    }
  };
}

