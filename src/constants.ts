export const controllerConsts = {
  lvl2extensions: 5
};

export const maxRolePopulation = {
  harvesters: 2,
  builders: 1,
  upgrader: 6,
  haulers: 0,
  total: 7
};

export enum Role {
  ROLE_HARVESTER,
  ROLE_UPGRADER,
  ROLE_HAULER,
  ROLE_BUILDER
}

type roleNames = { [key in Role]: any}
export const roleNames ={
    [Role.ROLE_HARVESTER]:"harvester",
    [Role.ROLE_UPGRADER]:"upgrader",
    [Role.ROLE_HAULER]:"hauler",
    [Role.ROLE_BUILDER]:"builder"
}

export enum actions {
    ACTION_HARVEST,
    ACTION_BUILD,
    ACTION_UPGRADE,
    ACTION_REPAIR,
    ACTION_TRANSFER
}
