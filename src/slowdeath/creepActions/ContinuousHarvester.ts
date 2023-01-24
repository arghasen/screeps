import { logger } from "utils/logger";
import { harvest } from "./CommonActions";

export class ContinuousHarvester {
  public static run = (creep: Creep): void => {
    if (!creep.memory.source) {
      const sources: Source[] = creep.room.find(FIND_SOURCES);
      sources.sort();
      const source = sources[creep.room.memory.continuousHarvesterCount % 2];
      creep.memory.source = source.id;
      creep.room.memory.continuousHarvesterCount++;
      const link = source.pos.findInRange(FIND_MY_STRUCTURES, 1,{filter:{structureType: STRUCTURE_LINK}})[0];
      if(link){
        creep.memory.link = link.id;
      }
    }
    const source = Game.getObjectById(creep.memory.source);
    if (source instanceof Source) {
      harvest(creep,source);
    }
    if(creep.store.getCapacity()>0 && creep.store.getFreeCapacity()==0){
      if(creep.room.memory.linksCreated == true){
        logger.info("link mining");
        if(creep.memory.link){
          const link = Game.getObjectById(creep.memory.link);
          if(link instanceof Structure && link.structureType == STRUCTURE_LINK){
            creep.transfer(link, RESOURCE_ENERGY);
            if(link.store.getUsedCapacity(RESOURCE_ENERGY)>=400){
              logger.info("link more than 50% full");
            }
          }
        }
      }
    }
  };
}
