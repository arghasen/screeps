import { logger } from "utils/logger";

export class Dismantler {
    public static run = (creep: Creep): void => {
        logger.info("dismantler");
        const flag = Game.flags["Attack"];
        if(flag){
            if(creep.pos.isNearTo(flag)){
                const target = creep.pos.findClosestByRange(FIND_STRUCTURES,
                    {filter: {structureType: STRUCTURE_WALL}});
                const ret = creep.dismantle(target!);
                logger.info(`dismantle result: ${ret}`);
            }
            else{
                creep.moveTo(flag);
            }
        }
    }

  }
  