import { CreepTask } from "./constants";
import { setCreepState } from "./creepState";

export class Actor {
  public static setTask(creep: Creep) {
    const aboutToDie = creep.ticksToLive && creep.ticksToLive < 100;
    const isInjured = creep.hits < creep.hitsMax;
    if (isInjured) {
      creep.room.memory.heal.push(creep.id);
    }
    if (aboutToDie && creep.room.controller?.my && creep.room.controller?.level >= 7) {
      creep.memory.task = CreepTask.RENEW;
    } else {
      setCreepState(creep);
    }
  }

  public static renewCreep(creep: Creep) {
    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    if (!creep.pos.inRangeTo(spawn, 1)) {
      creep.moveTo(spawn, { visualizePathStyle: { stroke: "#ffaa00" } });
    } else {
      const ret = spawn.renewCreep(creep);
      if (ret === ERR_FULL || ret === ERR_NOT_ENOUGH_ENERGY || ret === ERR_RCL_NOT_ENOUGH) {
        creep.memory.task = CreepTask.HARVEST;
      }
    }
  }
}
