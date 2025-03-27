import { logger } from "utils/logger";
import { getCreepNeedingEnergy, getEnergy, transfer, withdraw } from "./CommonActions";
import { setCreepState } from "./creepState";

export class Upgrader {
  public static run = (creep: Creep): void => {
    logger.info(`Upgrader run: ${creep.name}`);
    setCreepState(creep);
    if (!creep.memory.harvesting && creep.room.controller !== undefined) {
      // TODO: Ignore if target too far away
      if (creep.ticksToLive && creep.ticksToLive <= 5 && creep.store.energy > 15) {
        const target = getCreepNeedingEnergy(creep);
        if (target) {
          transfer(creep, target);
        }
      }

      if (
        creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE &&
        creep.fatigue === 0
      ) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    } else if (creep.room.memory.upgraderLink) {
      const upgraderLink = Game.getObjectById(creep.room.memory.upgraderLink);
      if (upgraderLink instanceof Structure && upgraderLink.structureType === STRUCTURE_LINK) {
        withdraw(creep, upgraderLink);
      }
    } else {
      getEnergy(creep);
    }
  };
}
