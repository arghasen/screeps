export function setCreepState(creep: Creep) {
    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.harvesting = true;
        creep.say("🔄 harvest");
    }
    if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
        creep.memory.harvesting = false;
    }
}