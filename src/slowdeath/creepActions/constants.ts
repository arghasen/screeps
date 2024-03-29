export const ControllerConsts: Record<string, number> = {
  lvl2extensions: 5
};

export const MaxRolePopulation = {
  continuousHarvester: 2,
  harvesters: 1,
  builders: 1,
  upgrader: 2,
  haulers: 1
};

export const PopulationScaler: Record<number, number> = {
  0: 4,
  1: 4,
  2: 4,
  3: 4,
  4: 4,
  5: 3,
  6: 3,
  7: 3,
  8: 3
};
export const MaxPopulationPerRoom: Record<number, number> = {
  0: 16,
  1: 16,
  2: 16,
  3: 16,
  4: 16,
  5: 10,
  6: 7,
  7: 7,
  8: 7
};
export enum Role {
  ROLE_HARVESTER,
  ROLE_UPGRADER,
  ROLE_HAULER,
  ROLE_BUILDER,
  ROLE_CONTINUOUS_HARVESTER,
  ROLE_REM_UPGRADER,
  ROLE_CLAIMER,
  ROLE_DISMANTLER
}

type RolePriotity = { [key in Role]: number };
export const rolePriotity: RolePriotity = {
  [Role.ROLE_HARVESTER]: 10,
  [Role.ROLE_UPGRADER]: 5,
  [Role.ROLE_HAULER]: 8,
  [Role.ROLE_BUILDER]: 6,
  [Role.ROLE_CONTINUOUS_HARVESTER]: 20,
  [Role.ROLE_REM_UPGRADER]: 2,
  [Role.ROLE_CLAIMER]: 1,
  [Role.ROLE_DISMANTLER]: 3
};

type RoleNames = { [key in Role]: string };
export const roleNames: RoleNames = {
  [Role.ROLE_HARVESTER]: "harvester",
  [Role.ROLE_UPGRADER]: "upgrader",
  [Role.ROLE_HAULER]: "hauler",
  [Role.ROLE_BUILDER]: "builder",
  [Role.ROLE_CONTINUOUS_HARVESTER]: "continuous_harvester",
  [Role.ROLE_REM_UPGRADER]: "remUpgrader",
  [Role.ROLE_CLAIMER]: "claimer",
  [Role.ROLE_DISMANTLER]: "dismantler"
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
