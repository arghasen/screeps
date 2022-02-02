export class ContinuousHarvester {
  static run = (creep: Creep) => {
    var source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (source) {
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  };
}
