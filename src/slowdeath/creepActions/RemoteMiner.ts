import { logger } from "../../utils/logger";
import { harvest, moveToOtherRoom, transfer, upgradeController } from "./CommonActions";

// Extend CreepMemory interface to include our custom properties
interface RemoteMinerMemory extends CreepMemory {
  init: boolean;
  targetRoom?: string;
  source?: Id<Source>;
  energyHarvested: number;
}

function setupMoveLoc(roomName: string) {
  return {
    x: 25,
    y: 25,
    roomName
  };
}

export class RemoteMiner {
  private static findTargetRoom(creep: Creep): string | null {
    // If no visible rooms with sources, try to explore
    const exits = Game.map.describeExits(creep.room.name);
    const reachableRooms = Object.values(exits).filter(roomName => roomName !== undefined);
    logger.info(`Reachable rooms: ${reachableRooms.join(", ")}`);
    if (reachableRooms.length > 0) {
      const randomRoom = reachableRooms[Math.floor(Math.random() * reachableRooms.length)];
      return randomRoom;
    }
    return null;
  }

  public static run = (creep: Creep): void => {
    logger.info(`RemoteMiner run: ${creep.name}`);
    const creepMemory = creep.memory as RemoteMinerMemory;
    if (!creepMemory.init) {
      creepMemory.init = true;
      Game.rooms[creep.room.name].memory.remoteMining.creepCost += creep.body.reduce(
        (sum, part) => sum + (BODYPART_COST[part.type] || 0),
        0
      );
    }

    // If creep is about to die, keep metrics in memory
    if (creep.ticksToLive && creep.ticksToLive <= 1) {
      Game.rooms[creepMemory.homeRoom].memory.remoteMining.energyHarvested += (creepMemory.energyHarvested || 0);
      creepMemory.energyHarvested = 0;
    }
    if (creep.memory.moveLoc) {
      return moveToOtherRoom(creep, creep.memory.moveLoc);
    }

    const remoteMining = Game.rooms[creepMemory.homeRoom].memory.remoteMining;
    if (creep.pos.roomName === creepMemory.homeRoom) {
      if (creep.store.getUsedCapacity() > 0) {
        if (!creep.room.controller) {
          remoteMining.energyTransferred += creep.store.energy;
          creep.drop(RESOURCE_ENERGY);
        } else if (creep.room.storage) {
          transfer(creep, creep.room.storage);
        } else {
          logger.info(`Upgrading controller for ${creep.name}`);
          upgradeController(creep, creep.room.controller);
          return;
        }
      } else if (!creepMemory.moveLoc) {
        if (!creepMemory.targetRoom) {
          const targetRoom = RemoteMiner.findTargetRoom(creep);
          if (targetRoom) {
            creepMemory.targetRoom = targetRoom;
          }
        }
        if (creepMemory.targetRoom) {
          creepMemory.moveLoc = setupMoveLoc(creepMemory.targetRoom);
        } else {
          logger.debug(`No suitable rooms found for remote mining: ${creep.name}`);
          return;
        }
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.store.getFreeCapacity() > 0) {
        harvest(creep, sources[0]);
      } else {
        // Move to home room
        if (!creepMemory.moveLoc) {
          creepMemory.moveLoc = setupMoveLoc(creepMemory.homeRoom);
          creepMemory.energyHarvested += creep.store.energy;
        }
      }
    }
  };
}
