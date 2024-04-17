import { logger } from "utils/logger";
import { objectFromId } from "utils/screeps-fns";
import { harvest, transfer } from "./CommonActions";

export class ContinuousHarvester {
  public static run = (creep: Creep): void => {
    if (!creep.memory.source) {
      initializeCreepMemory(creep);
    }

    const source = objectFromId(creep.memory.source!);
    harvest(creep, source);
   
    if(creep.ticksToLive == 1){
      handleCreepDeath(creep, source);
    }
   
    if (creep.store.getCapacity() > 0 && creep.store.getFreeCapacity() == 0) {
      if (creep.room.memory.linksCreated == true) {
        logger.debug("link mining");
        // FIXME: a poor emergency mode
        if (creep.room.energyAvailable > 2000) {
          handleLinkMining(creep);
        }
      }
    }
  }
};

function initializeCreepMemory(creep: Creep) {
  const sources: Source[] = creep.room.find(FIND_SOURCES);
  sources.sort();
  const source = sources[creep.room.memory.continuousHarvesterCount % 2];
  creep.memory.source = source.id;
  creep.room.memory.continuousHarvesterCount++;
  const link = source.pos.findInRange(FIND_MY_STRUCTURES, 2, { filter: { structureType: STRUCTURE_LINK } })[0];
  if (link) {
    creep.memory.link = link.id as Id<StructureLink>;
  }
}

function handleCreepDeath(creep: Creep, source: Source | null) {
  const startTime = creep.room.memory.harvesterStartTime[source!.id];
  if (startTime.length >= 10) {
    startTime.shift();
  }
  startTime.push(creep.memory.harvestStartTime!);
  startTime[0] = startTime.reduce((a, b) => a + b) / startTime.length;
}

function handleLinkMining(creep: Creep) {
  if (creep.memory.link) {
    const link = objectFromId(creep.memory.link);
    logger.debug(`link to be used ${link}`)
    if (link) {
      transfer(creep, link);
      if (link.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && link.cooldown === 0) {
        logger.debug("link more than 50% full");
        transferToUpgraderLink(link);
      }
    }
  }

  function transferToUpgraderLink(link: StructureLink) {
    if (creep.room.memory.upgraderLink) {
      const upgraderLink = objectFromId(creep.room.memory.upgraderLink);
      const ret = link.transferEnergy(upgraderLink!);
      logger.debug(`link result: ${ret}`)
    }
  }
}
