import { logger } from "../../utils/logger";
import { Role } from "./constants";

export function pickup(creep: Creep, closestSource: Resource) {
  if (creep.pickup(closestSource) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
    creep.moveTo(closestSource, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

export function harvest(creep: Creep, source:Source|null) {
  if (source) {
    if (creep.harvest(source) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }
}

export function repair(creep: Creep, targetStructure: AnyStructure) {
  if (creep.repair(targetStructure) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
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
  if (creep.build(target) === ERR_NOT_IN_RANGE && creep.fatigue === 0) {
    creep.moveTo(target, {visualizePathStyle: { stroke: "#ffffff" }
    });
  }
}

export function pickupDroppedEnergy(creep: Creep) {
  const energyResources = getDroppedEnergySources(creep);
  if (energyResources.length >= 1) {
    const closestSource = getClosestDroppedEnergySource();
    if (closestSource instanceof Resource) {
      pickup(creep, closestSource);
    }
  }

  function getClosestDroppedEnergySource() {
    let closestSource;
    if (energyResources[0].amount > 1000) {
      closestSource = energyResources[0];
    } else {
      closestSource = creep.pos.findClosestByPath(energyResources);
    }
    logger.debug(
      `creep: ${creep.name} closest source: ${logger.json(closestSource)} of dropped energy`
    );
    return closestSource;
  }
}

function getDroppedEnergySources(creep: Creep) {
  const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
  const energyResources = _.filter(
    droppedResources,
    droppedResource => droppedResource.resourceType === RESOURCE_ENERGY
  );
  if (energyResources.length >= 2) {
    energyResources.sort((a, b) => b.amount - a.amount);
  }
  return energyResources;
}

export function getEnergy(creep: Creep) {
  const stores = getEnergyStore(creep);
  logger.info(`upgrader ${creep.name} energy stores:${logger.json(stores)}`);
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
  const targets = structures.filter(structure => {
    return ((structure.structureType === STRUCTURE_EXTENSION ||
      structure.structureType === STRUCTURE_SPAWN) &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
  });

  logger.debug(creep.name + logger.json(targets));
  const target = creep.pos.findClosestByPath(targets);
  logger.debug(`closest spawn or extension :  ${logger.json(target)}`);

  if (!target) {
    const targets2 = structures.filter(structure => {
      return (
        (structure.structureType === STRUCTURE_CONTAINER ||
          structure.structureType === STRUCTURE_TOWER) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    });
    const target2 = creep.pos.findClosestByPath(targets2);
    logger.debug(`closest container or tower: ${logger.json(target2)}`);
    return target2;
  }
  return target;
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
      creepTo.memory.role !== Role.ROLE_HAULER &&
      creepTo.store.getFreeCapacity() < creepTo.store.getCapacity() * 0.9
  });
}

export function findStructureNeedingRepair(room: Room, pos: RoomPosition): AnyStructure | null {
  const myStructures = room.find(FIND_STRUCTURES);
  const targetStructures = myStructures.filter(
    structure => (structure.hits < structure.hitsMax &&
      structure.structureType !== STRUCTURE_WALL &&
      structure.structureType !== STRUCTURE_RAMPART) ||
      (structure.structureType === STRUCTURE_RAMPART && structure.hits < 15000)
  );
  const targetStructure = pos.findClosestByRange(targetStructures);
  return targetStructure;
}

export function transferEnergyFromCreep(creep: Creep) {
  const targetCreep = getCreepNeedingEnergy(creep);
  logger.debug(`targetCreep:${logger.json(targetCreep)} for hauler: ${logger.json(creep)}`);
  if (targetCreep) {
    transfer(creep, targetCreep);
  }
}