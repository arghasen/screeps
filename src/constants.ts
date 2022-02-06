export const controllerConsts: any = {
  lvl2extensions: 5
};

export const maxRolePopulation: any = {
  continuous_harvester: 2,
  harvesters: 1,
  builders: 2,
  upgrader: 1,
  haulers: 2,
  total: 7
};

export enum Role {
  ROLE_HARVESTER,
  ROLE_UPGRADER,
  ROLE_HAULER,
  ROLE_BUILDER,
  ROLE_CONTINUOUS_HARVESTER,
  ROLE_REM_UPGRADER
}

type RoleNames = { [key in Role]: string };
export const roleNames: RoleNames = {
  [Role.ROLE_HARVESTER]: 'harvester',
  [Role.ROLE_UPGRADER]: 'upgrader',
  [Role.ROLE_HAULER]: 'hauler',
  [Role.ROLE_BUILDER]: 'builder',
  [Role.ROLE_CONTINUOUS_HARVESTER]: 'continuous_harvester',
  [Role.ROLE_REM_UPGRADER]: 'remUpgrader'
};

export enum actions {
  ACTION_HARVEST,
  ACTION_BUILD,
  ACTION_UPGRADE,
  ACTION_REPAIR,
  ACTION_TRANSFER
}
export const directionsArray: number[][] = [
  [1, 1],
  [1, -1],
  [-1, -1],
  [-1, 1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1]
];


export const extensionLoc: any = {
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
