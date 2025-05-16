import { objectFromId } from "utils/screeps-fns";
import { logger } from "../../utils/logger";
import { Role } from "./constants";

export function moveToOtherRoom(creep: Creep, moveLoc: MoveLoc) {
  const target = new RoomPosition(moveLoc.x, moveLoc.y, moveLoc.roomName);
  logger.debug("Moving.location", logger.json(target));
  creep.moveTo(target);

  if (moveLoc.roomName === creep.pos.roomName) {
    delete creep.memory.moveLoc;
  }
}

export function pickup(creep: Creep, closestSource: Resource) {
  if (creep.pickup(closestSource) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
    creep.moveTo(closestSource, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

export function upgradeController(creep: Creep, controller: StructureController) {
  if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
    creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

export function harvest(creep: Creep, source: Source | Deposit | Mineral | null) {
  if (source) {
    const res = creep.harvest(source);
    if (res === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    } else if (!creep.memory.harvestStartTime && res === OK) {
      creep.memory.harvestStartTime = creep.ticksToLive;
    }
  }
}

export function repair(creep: Creep, targetStructure: AnyStructure) {
  if (creep.pos.inRangeTo(targetStructure, 3)) {
    creep.repair(targetStructure);
  } else if (creep.fatigue === 0) {
    creep.moveTo(targetStructure, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

export function withdraw(creep: Creep, store: AnyStructure) {
  if (creep.withdraw(store, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
    creep.moveTo(store, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

export function transfer(creep: Creep, target: AnyCreep | Structure) {
  if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
  }
}

export function build(creep: Creep, target: ConstructionSite) {
  if (!target) return;
  if (creep.pos.inRangeTo(target, 3)) {
    creep.build(target);
  } else if (creep.fatigue === 0) {
    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
  }
}

const DROPPED_ENERGY_THRESHOLD = 500;

function getDroppedEnergySources(creep: Creep): Resource[] {
  const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
  return droppedResources
    .filter((resource: Resource) => resource.resourceType === RESOURCE_ENERGY)
    .sort((a: Resource, b: Resource) => b.amount - a.amount);
}

function getClosestDroppedEnergySource(creep: Creep, energyResources: Resource[]): Resource | null {
  if (!energyResources.length) return null;
  const largeDrops = energyResources.filter(
    resource => resource.amount >= DROPPED_ENERGY_THRESHOLD
  );
  if (largeDrops.length > 0) {
    return largeDrops[0];
  }
  return creep.pos.findClosestByPath(energyResources);
}

export function pickupDroppedEnergy(creep: Creep): boolean {
  let target = extractTarget<Resource>(creep);
  if (!target) {
    const energyResources = getDroppedEnergySources(creep);
    target = getClosestDroppedEnergySource(creep, energyResources);

    if (target) {
      creep.memory.target = target.id;
      logger.debug(
        `Creep ${creep.name} found new energy target: ${target.id} with amount ${target.amount}`
      );
    }
  }
  if (target) {
    pickup(creep, target);
    return true;
  }
  return false;
}

function extractTarget<T extends _HasId>(creep: Creep): T | null {
  let target: T | null = null;
  if (creep.memory.target) {
    target = objectFromId<T>(creep.memory.target as Id<T>);
    if (!target) {
      logger.debug(`creep memory has invalid target ${logger.json(creep)}`);
      creep.memory.target = undefined;
    }
  }
  return target;
}

export function getEnergy(creep: Creep) {
  const stores = getEnergyStore(creep);
  const store = creep.pos.findClosestByPath(stores);
  if (store) {
    withdraw(creep, store);
  } else {
    pickupOrHarvest(creep);
  }
}

function getEnergyStore(creep: Creep) {
  const structures = creep.room.find(FIND_STRUCTURES);
  const stores = structures.filter(
    structure =>
      (structure.structureType === STRUCTURE_CONTAINER ||
        structure.structureType === STRUCTURE_STORAGE) &&
      structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()
  );
  return stores;
}

export function getStructuresNeedingEnergy(creep: Creep): AnyStructure | null {
  const structures = creep.room.find(FIND_STRUCTURES);
  const primaryTargets = structures.filter(structure => {
    return (
      (structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_SPAWN) &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
  });

  logger.debug(creep.name + logger.json(primaryTargets));
  const primaryTarget = creep.pos.findClosestByPath(primaryTargets);
  if (primaryTarget) {
    logger.debug(
      `${creep.name} pos: ${logger.json(creep.pos)}  closest spawn or extension :  ${logger.json(
        primaryTarget
      )}`
    );
    return primaryTarget;
  }

  const secondaryTargets = structures.filter(structure => {
    return (
      structure.structureType === STRUCTURE_TOWER &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
  });
  const secondaryTarget = creep.pos.findClosestByPath(secondaryTargets);
  logger.debug(
    `${creep.name} pos: ${logger.json(creep.pos)} closest container or tower: ${logger.json(
      secondaryTarget
    )}`
  );
  return secondaryTarget;
}

export function pickupOrHarvest(creep: Creep) {
  if (creep.room.memory.continuousHarvestingStarted) {
    pickupDroppedEnergy(creep);
  } else {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    harvest(creep, source);
  }
}

export function getCreepNeedingEnergy(creep: Creep) {
  return creep.pos.findClosestByRange(FIND_CREEPS, {
    filter: creepTo =>
      creepTo.memory.role !== Role.HAULER &&
      creepTo.store.getFreeCapacity() < creepTo.store.getCapacity() * 0.9
  });
}

export function findStructureNeedingRepair(
  room: Room,
  pos: RoomPosition,
  type: "tower" | "creep"
): AnyStructure | null {
  const myStructures = room.find(FIND_STRUCTURES);
  // FIXME: 300 is minumum a tower can heal, improve to a distance based logic
  // Towers healing is more expensive than builders so we repair if its getting low
  let targetRatio = 0.4;
  switch (type) {
    case "tower":
      targetRatio = 0.4;
      break;
    case "creep":
      targetRatio = 0.9;
      break;
  }
  const targetStructures = myStructures.filter(
    structure =>
      structure.hits < structure.hitsMax * targetRatio &&
      structure.structureType !== STRUCTURE_WALL &&
      structure.structureType !== STRUCTURE_RAMPART
  );

  const obstacles = myStructures.filter(
    structure =>
      (structure.structureType === STRUCTURE_RAMPART &&
        structure.hits < getRampartMaxHits(room.controller?.level)) ||
      (structure.structureType === STRUCTURE_WALL &&
        structure.hits < getWallMaxHits(room.controller?.level))
  );

  if (Game.time % 20 === 0 && type === "tower") {
    obstacles.sort((a, b) => {
      return a.hits - b.hits;
    });
    return obstacles[0];
  } else {
    const targetStructure = pos.findClosestByRange(targetStructures);
    return targetStructure;
  }
}

const wallMaxHits: Record<number, number> = {
  3: 20000,
  4: 50000,
  5: 125000,
  6: 250000,
  7: 1000000,
  8: 10000000
};

function getWallMaxHits(level: number | undefined): number {
  return level ? wallMaxHits[level] || 70000 : 0;
}

function getRampartMaxHits(level: number | undefined): number {
  return getWallMaxHits(level);
}

export function transferEnergyFromCreep(creep: Creep) {
  const targetCreep = getCreepNeedingEnergy(creep);
  logger.debug(`targetCreep:${logger.json(targetCreep)} for hauler: ${logger.json(creep)}`);
  if (targetCreep) {
    transfer(creep, targetCreep);
    return true;
  }
  return false;
}

export function useUpEnergy(room: Room) {
  return (room.storage?.store[RESOURCE_ENERGY] || 0) > 200000;
}
