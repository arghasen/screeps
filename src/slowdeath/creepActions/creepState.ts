import { CreepTask } from "./constants";

export function setCreepState(creep: Creep) {
  if (!creep.memory.task && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.task = CreepTask.HARVEST;
    creep.memory.target = undefined;
  }
  if (creep.memory.task === CreepTask.HARVEST && creep.store.getFreeCapacity() === 0) {
    creep.memory.task = CreepTask.UNKNOWN;
  }
}
