import { harvest } from "./CommonActions";

export class ContinuousHarvester {
  public static run = (creep: Creep): void => {
    if (!creep.memory.source) {
      const sources: Source[] = creep.room.find(FIND_SOURCES);
      sources.sort();
      creep.memory.source = sources[creep.room.memory.continuousHarvesterCount % 2].id;
      creep.room.memory.continuousHarvesterCount++;
    }
    const source = Game.getObjectById(creep.memory.source);
    if (source instanceof Source) {
      harvest(creep,source);
    }
  };
}
