export const ControllerConsts: Record<string, number> = {
  lvl2extensions: 5,
  lvl3extensions: 10,
  lvl4extensions: 20,
  lvl5extensions: 30,
  lvl6extensions: 40,
  lvl7extensions: 50,
  lvl8extensions: 60
};
export enum RoomLevel {
  LEVEL_0,
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
  LEVEL_6,
  LEVEL_7,
  LEVEL_8
}

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
  5: 7,
  6: 7,
  7: 7,
  8: 7
};
export enum Role {
  HARVESTER,
  UPGRADER,
  HAULER,
  BUILDER,
  CONTINUOUS_HARVESTER,
  REM_UPGRADER,
  CLAIMER,
  DISMANTLER,
  REMOTE_MINER
}

type RolePriotity = { [key in Role]: number };
export const rolePriotity: RolePriotity = {
  [Role.HARVESTER]: 10,
  [Role.UPGRADER]: 5,
  [Role.HAULER]: 8,
  [Role.BUILDER]: 6,
  [Role.CONTINUOUS_HARVESTER]: 20,
  [Role.REM_UPGRADER]: 2,
  [Role.CLAIMER]: 1,
  [Role.DISMANTLER]: 3,
  [Role.REMOTE_MINER]: 4
};

type RoleNames = { [key in Role]: string };
export const roleNames: RoleNames = {
  [Role.HARVESTER]: "harvester",
  [Role.UPGRADER]: "upgrader",
  [Role.HAULER]: "hauler",
  [Role.BUILDER]: "builder",
  [Role.CONTINUOUS_HARVESTER]: "continuous_harvester",
  [Role.REM_UPGRADER]: "remUpgrader",
  [Role.CLAIMER]: "claimer",
  [Role.DISMANTLER]: "dismantler",
  [Role.REMOTE_MINER]: "remote_miner"
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

export function calculateExtensionPositions(level: number): number[][] {
  const positions: number[][] = [];
  const maxExtensions = ControllerConsts[`lvl${level}extensions`] || 0;

  // Calculate how many rings we need based on the number of extensions
  // Each ring can hold 8 * ringNumber extensions
  let currentRing = 1;
  let extensionsInRings = 0;

  while (extensionsInRings < maxExtensions) {
    extensionsInRings += 8 * currentRing;
    currentRing++;
  }

  // Generate positions for each ring
  for (let ring = 1; ring < currentRing; ring++) {
    // For each ring, we need to generate positions in a clockwise pattern
    // starting from top-right
    const ringSize = ring;

    // Generate positions for each side of the ring
    for (let i = 0; i < ringSize; i++) {
      // Top side
      positions.push([i, -ringSize]);
      // Right side
      positions.push([ringSize, -i]);
      // Bottom side
      positions.push([i, ringSize]);
      // Left side
      positions.push([-ringSize, -i]);
    }
  }

  // Trim to exact number needed
  return positions.slice(0, maxExtensions);
}

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
