import { getStructuresNeedingEnergy, harvest, pickupOrHarvest, transfer } from "./CommonActions";

export class Harvester {
  public static run = (creep: Creep): void => {
    if (creep.store.getFreeCapacity() > 0) {
      pickupOrHarvest(creep);
    } else {
      const target = getStructuresNeedingEnergy(creep);
      if (target) {
        transfer(creep, target);
      } else {

      }
    }
  };
}
