import {
  getStructuresNeedingEnergy,
  pickupDroppedEnergy,
  transfer,
  transferEnergyFromCreep
} from "./CommonActions";
import { setCreepState } from "./creepState";

export class Hauler {
  public static run = (creep: Creep): void => {
    setCreepState(creep);

    if (!creep.memory.harvesting) {
      const target = getStructuresNeedingEnergy(creep);
      const storage = creep.room.storage;
      if (target) {
        // TODO: check why this is not working with the func.
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        } // no target exist, then transfer energy to storage
      } else if (storage && storage.store.getCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, storage);
      } else {
        // no target exist, then transfer energy to creeps
        transferEnergyFromCreep(creep);
      }
    } else {
      creep.memory.harvesting = true;
      pickupDroppedEnergy(creep);
    }
  };
}
