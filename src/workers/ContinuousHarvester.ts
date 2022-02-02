export class ContinuousHarvester {
  static run = (creep: Creep) => {
    if (!creep.memory.source) {
      var sources = creep.room.find(FIND_SOURCES);
      sources.sort();
      creep.memory.source = sources[Memory.count % 2].id;
    }
    var source = Game.getObjectById(creep.memory.source);
    if (source instanceof Source) {
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  };
}


