import { Role, roleNames } from "slowdeath/creepActions/constants";
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

export function getContinuousHarvestor(energyCapacityAvailable: number): CreepSpawnData {
  return {
    build: getContinuousHarvesterBody(energyCapacityAvailable),
    name: `cont_harv-${Game.time}`,
    options: { memory: { role: Role.CONTINUOUS_HARVESTER, harvesting: false } }
  };
}

export function getClaimer(energyCapacityAvailable: number): CreepSpawnData | null {
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
          harvesting: false
        }
      }
    };
  }
  return null;
}

export function getHauler(energyCapacityAvailable: number, role: Role): CreepSpawnData {
  return {
    build: getHaulerBody(energyCapacityAvailable),
    name: `${roleNames[role]}-${Game.time}`,
    options: { memory: { role: role, harvesting: false } }
  };
}

export function getRemoteBuilder(energyCapacityAvailable: number): CreepSpawnData {
  return {
    build: getBuilderBody(energyCapacityAvailable),
    name: `rembuilder-${Game.time}`,
    options: {
      memory: {
        role: Role.BUILDER,
        moveLoc: Memory.needBuilder.moveLoc,
        harvesting: false
      }
    }
  };
}

export function getEmergencyCreep(): CreepSpawnData {
  return {
    build: [WORK, CARRY, MOVE],
    name: `$emergency-${Game.time}`,
    options: { memory: { role: Role.HARVESTER, harvesting: false } }
  };
}