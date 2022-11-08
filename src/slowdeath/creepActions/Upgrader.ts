import { getEnergy } from "./CommonActions";

export class Upgrader {
  public static run = (creep: Creep): void => {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    if (creep.memory.upgrading && creep.room.controller !== undefined) {
      if (
        creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE &&
        creep.fatigue === 0
      ) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    } else {
      getEnergy(creep);
    }
  };
}
