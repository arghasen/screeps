import { CreepTask, Role, roleNames } from "slowdeath/creepActions/constants";
export function getContinuousHarvesterBody(energyCapacityAvailable: number): BodyPartConstant[] {
  let body: BodyPartConstant[] = [];
  if (energyCapacityAvailable > 1000) {
    body = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
  } else {
    body = [WORK, WORK, WORK, WORK, WORK, MOVE];
  }
  return body;
}

export function getHaulerBody(energyCapacityAvailable: number): BodyPartConstant[] {
  let body: BodyPartConstant[] = [];
  if (energyCapacityAvailable >= 300 && energyCapacityAvailable < 400) {
    body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
  } else if (energyCapacityAvailable >= 400 && energyCapacityAvailable < 500) {
    body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
  } else if (energyCapacityAvailable >= 500 && energyCapacityAvailable < 800) {
    body = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
  } else if (energyCapacityAvailable >= 800) {
    body = [
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ];
  }
  return body;
}
export function getUpgraderBody(
  energyCapacityAvailable: number,
  staticUpgrades: boolean
): BodyPartConstant[] {
  if (staticUpgrades) {
    return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
  }
  return getBuilderBody(energyCapacityAvailable);
}
export function getBuilderBody(energyCapacityAvailable: number): BodyPartConstant[] {
  let body: BodyPartConstant[] = [];

  if (energyCapacityAvailable >= 400 && energyCapacityAvailable < 600) {
    body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
  } else if (energyCapacityAvailable >= 600 && energyCapacityAvailable < 1100) {
    body = [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
  } else if (energyCapacityAvailable >= 1100) {
    body = [
      WORK,
      WORK,
      WORK,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ];
  } else {
    body = [WORK, CARRY, MOVE];
  }
  return body;
}

export function getSpawnCost(body: BodyPartConstant[]) {
  let cost = 0;
  for (const part of body) {
    cost += BODYPART_COST[part];
  }
  return cost;
}

export function getContinuousHarvestor(
  energyCapacityAvailable: number,
  roomName: string
): CreepSpawnData {
  return {
    build: getContinuousHarvesterBody(energyCapacityAvailable),
    name: `cont_harv-${Game.time}`,
    options: {
      memory: { role: Role.CONTINUOUS_HARVESTER, task: CreepTask.UNKNOWN, homeRoom: roomName }
    }
  };
}

export function getClaimer(
  energyCapacityAvailable: number,
  roomName: string
): CreepSpawnData | null {
  let body: BodyPartConstant[] = [];
  if (energyCapacityAvailable >= 650) {
    body = [CLAIM, MOVE];
    return {
      build: body,
      name: `creep-${Game.time}`,
      options: {
        memory: {
          role: Role.CLAIMER,
          moveLoc: Memory.createClaimer?.loc,
          identifier: Memory.createClaimer?.identifier,
          task: CreepTask.UNKNOWN,
          homeRoom: roomName
        }
      }
    };
  }
  return null;
}

export function getHauler(
  energyCapacityAvailable: number,
  role: Role,
  roomName: string
): CreepSpawnData {
  return {
    build: getHaulerBody(energyCapacityAvailable),
    name: `${roleNames[role]}-${Game.time}`,
    options: { memory: { role, task: CreepTask.UNKNOWN, homeRoom: roomName } }
  };
}

export function getRemoteBuilder(
  energyCapacityAvailable: number,
  roomName: string
): CreepSpawnData {
  return {
    build: getBuilderBody(energyCapacityAvailable),
    name: `rembuilder-${Game.time}`,
    options: {
      memory: {
        role: Role.BUILDER,
        moveLoc: Memory.needBuilder.moveLoc,
        task: CreepTask.UNKNOWN,
        homeRoom: roomName
      }
    }
  };
}

export function getEmergencyCreep(roomName: string): CreepSpawnData {
  return {
    build: [WORK, CARRY, MOVE],
    name: `$emergency-${Game.time}`,
    options: { memory: { role: Role.HARVESTER, task: CreepTask.UNKNOWN, homeRoom: roomName } }
  };
}

export function getRemoteMinerBody(energyCapacityAvailable: number): BodyPartConstant[] {
  if (energyCapacityAvailable >= 1000) {
    return [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
  }
  return [WORK, CARRY, MOVE];
}

export function getMineralMinerBody(
  energyCapacityAvailable: number,
  roomName: string
): BodyPartConstant[] {
  if (energyCapacityAvailable >= 2000) {
    return [
      WORK,
      WORK,
      WORK,
      WORK,
      WORK,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE
    ];
  } else if (energyCapacityAvailable >= 1000) {
    return [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
  } else {
    return [WORK, CARRY, MOVE];
  }
}

export function getRemoteMiner(energyCapacityAvailable: number, roomName: string): CreepSpawnData {
  return {
    build: getRemoteMinerBody(energyCapacityAvailable),
    name: `rem_miner-${Game.time}`,
    options: { memory: { role: Role.REMOTE_MINER, task: CreepTask.UNKNOWN, homeRoom: roomName } }
  };
}
