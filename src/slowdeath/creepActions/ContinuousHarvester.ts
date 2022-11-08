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
      if (creep.harvest(source) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
        creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  };
}
