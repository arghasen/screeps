export const ControllerConsts: Record<string, number> = {
  lvl2extensions: 5
};

export const MaxRolePopulation = {
  continuousHarvester: 2,
  harvesters: 1,
  builders: 1,
  upgrader: 2,
  haulers: 1,
  total: 4
};
export const MaxPopulationPerRoom : Record<number, number> = {
  0: 18,
  1: 18,
  2: 18,
  3: 18,
  4: 18,
  5: 18,
  6: 18,
  7: 18,
  8: 18
}
export enum Role {
  ROLE_HARVESTER,
  ROLE_UPGRADER,
  ROLE_HAULER,
  ROLE_BUILDER,
  ROLE_CONTINUOUS_HARVESTER,
  ROLE_REM_UPGRADER,
  ROLE_CLAIMER
}

type RoleNames = { [key in Role]: string };
export const roleNames: RoleNames = {
  [Role.ROLE_HARVESTER]: "harvester",
  [Role.ROLE_UPGRADER]: "upgrader",
  [Role.ROLE_HAULER]: "hauler",
  [Role.ROLE_BUILDER]: "builder",
  [Role.ROLE_CONTINUOUS_HARVESTER]: "continuous_harvester",
  [Role.ROLE_REM_UPGRADER]: "remUpgrader",
  [Role.ROLE_CLAIMER]: "claimer"
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
    [0, -1],
    [1, 2],
    [2, 1],
    [-1, 2],
    [2, 2],
    [-2, -2],
    [-1, -2],
    [0, 2],
    [0, -2],
    [-2, 0],
    [2, 0]
  ]
};

export enum RoadStatus {
  NONE,
  BUILDING_TO_SOURCES,
  TO_SOURCES,
  BUILDING_TO_CONTROLLER,
  TO_CONTROLLER,
  BUILDING_TO_LVL3EXT,
  TO_LVL3EXT,
  BUILDING_TO_STORAGE,
  TO_STORAGE
}