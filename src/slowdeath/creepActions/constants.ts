export const ControllerConsts: Record<string, number> = {
  lvl2extensions: 5
};

export const MaxRolePopulation = {
  continuousHarvester: 2,
  harvesters: 1,
  builders: 1,
  upgrader: 2,
  haulers: 0,
  total: 4
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
  [Role.ROLE_HARVESTER]: "harvester",
  [Role.ROLE_UPGRADER]: "upgrader",
  [Role.ROLE_HAULER]: "hauler",
  [Role.ROLE_BUILDER]: "builder",
  [Role.ROLE_CONTINUOUS_HARVESTER]: "continuous_harvester",
  [Role.ROLE_REM_UPGRADER]: "remUpgrader"
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

export const extensionLoc: Record<number, number[][]> = {
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
