import { transfer } from "./CommonActions";

export class MineralMiner {
  public static run = (creep: Creep): void => {
    const source = creep.pos.findClosestByRange(FIND_DEPOSITS);
    if (source) {
      if (creep.store.getFreeCapacity() > 0) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      } else {
        const structures = creep.room.find(FIND_STRUCTURES);
        const target = structures.find(structure => structure.structureType === STRUCTURE_STORAGE);
        if (target) {
          transfer(creep, target);
        }
      }
    }
  };
}