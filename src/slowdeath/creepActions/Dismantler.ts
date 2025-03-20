import { logger } from "utils/logger";

export class Dismantler {
  public static run = (creep: Creep): void => {
    logger.debug("dismantler");
    const flag = Game.flags["Attack"];
    if (flag) {
      if (creep.pos.isNearTo(flag)) {
        const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: { structureType: STRUCTURE_WALL }
        });
        if (target) {
          const ret = creep.dismantle(target);
          logger.debug(`dismantle result: ${ret}`);
        }
      } else {
        creep.moveTo(flag);
      }
    }
  };
}
