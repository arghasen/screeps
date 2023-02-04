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
    } else if (energyCapacityAvailable > 800) {
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
  
    if (energyCapacityAvailable > 400 && energyCapacityAvailable <= 600) {
      body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    } else if (energyCapacityAvailable > 600 && energyCapacityAvailable < 1000) {
      body = [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    } else if (energyCapacityAvailable > 1100) {
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