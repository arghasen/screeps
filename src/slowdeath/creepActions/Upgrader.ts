import { getCreepNeedingEnergy, getEnergy, transfer, withdraw } from "./CommonActions";
import { CreepTask } from "./constants";
import { objectFromId } from "utils/screeps-fns";
import { Actor } from "./Actor";

export class Upgrader extends Actor {
  public static run = (creep: Creep): void => {
    super.setCreepState(creep);
    if (creep.memory.task !== CreepTask.HARVEST && creep.room.controller?.my) {
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
      const upgraderLink = objectFromId<StructureLink>(creep.room.memory.upgraderLink);
      if (!upgraderLink) {
        delete creep.room.memory.upgraderLink;
      } else {
        withdraw(creep, upgraderLink);
      }
    } else {
      getEnergy(creep);
    }
  };
}
