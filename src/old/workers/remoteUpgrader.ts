import { harvest, pickupDroppedEnergy } from "./CommonActions";

export class RemUpgrader {
  public static run = (creep: Creep): void => {
    if (creep.room.name !== "W29N19") {
      var target = new RoomPosition(12, 33, "W29N19");
      const ret = creep.moveTo(target, {
        visualizePathStyle: { stroke: "#90ffff" }
      });
      console.log("REM UPGRADER", ret);
      return;
    }
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    if (creep.memory.upgrading && creep.room.controller !== undefined) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    } else {
      let structures = creep.room.find(FIND_STRUCTURES);
      let stores = structures.filter(
        structure =>
          (structure.structureType === STRUCTURE_CONTAINER ||
            structure.structureType === STRUCTURE_STORAGE) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()
      );
      console.log("upgrader", creep.name, "energy stores:", stores);
      if (stores.length >= 1) {
        let store = creep.pos.findClosestByPath(stores);
        if (store) {
          if (creep.withdraw(store, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(store, { visualizePathStyle: { stroke: "#ffaa00" } });
            return;
          }
        }
      } else {
        let source = creep.pos.findClosestByPath(FIND_SOURCES);
        harvest(source, creep);
      }
    }
  };
}
