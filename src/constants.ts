export const controllerConsts = {
  lvl2extensions: 5
};

export const maxRolePopulation = {
  continuous_harvester: 2,
  harvesters: 1,
  builders: 2,
  upgrader: 4,
  haulers: 2,
  total: 7
};

export enum Role {
  ROLE_HARVESTER,
  ROLE_UPGRADER,
  ROLE_HAULER,
  ROLE_BUILDER,
  ROLE_CONTINUOUS_HARVESTER
}

type roleNames = { [key in Role]: any };
export const roleNames = {
  [Role.ROLE_HARVESTER]: 'harvester',
  [Role.ROLE_UPGRADER]: 'upgrader',
  [Role.ROLE_HAULER]: 'hauler',
  [Role.ROLE_BUILDER]: 'builder',
  [Role.ROLE_CONTINUOUS_HARVESTER]: 'continuous_harvester'
};

export enum actions {
  ACTION_HARVEST,
  ACTION_BUILD,
  ACTION_UPGRADE,
  ACTION_REPAIR,
  ACTION_TRANSFER
}

export const extensionLoc = {
  2: [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
  ]
};
