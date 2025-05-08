import { getStructuresNeedingEnergy, harvest, pickupOrHarvest, transfer } from "./CommonActions";

export class Harvester {
  public static run = (creep: Creep): void => {
    if (creep.store.getFreeCapacity() > 0) {
      harvest(creep, creep.pos.findClosestByRange(FIND_DEPOSITS));
    } else {
      const structures = creep.room.find(FIND_STRUCTURES);
      const target = structures.find(structure => structure.structureType === STRUCTURE_STORAGE);
      if (target) {
        transfer(creep, target);
      }
    }
  };
}
