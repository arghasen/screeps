let Cache: { [key: string]: unknown } = {};
let cacheTick = 0;

/**
 * Takes an array of game objects and _deflates_ them into an array of strings that can be placed in memory.
 *
 * @param objects An array of game objects to deflate.
 *
 * @returns An array of strings
 */
function deflate<T extends _HasId>(objects: T[]) {
  return objects.map(object => {
    return object.id;
  });
}

/**
 * Infalte is an alias for `objectsFromIds`
 *
 * @see objectsFromIds
 */
function inflate<T extends _HasId>(ids: Id<T>[]) {
  return objectsFromIds<T>(ids);
}
/**
 * Turn an array of object IDs into Objects.
 *
 * @param ids An array of IDs to get the objects for.
 */
function objectsFromIds<T extends _HasId>(ids: Id<T>[]) {
  return ids.map(id => objectFromId<T>(id));
}

/**
 * Get an object from its ID.
 *
 * @param id The id of the object you want to retrive
 */
export default function objectFromId<T extends _HasId>(id: Id<T>) {
  return Game.getObjectById<T>(id);
}

/**
 * Stores the computed value for the duration of the tick.
 *
 * @param key The key to store the value under (must be unique)
 * @param create A function that returns the value to store, will only be called once in a tick.
 */
function cacheInTick<T>(key: string, create: () => T): T {
  if (cacheTick !== Game.time) {
    Cache = {};
    cacheTick = Game.time;
  }

  if (Cache[key]) {
    return Cache[key] as T;
  }

  Cache[key] = create();
  return Cache[key] as T;
}

/**
 * Removes dead creeps from the Memory Object
 */
function clearDeadCreepsFromMemory() {
  for (const creepName in Memory.creeps) {
    if (!isCreepAlive(creepName)) {
      delete Memory.creeps[creepName];
    }
  }
}

/**
 * Returns true if the creep is alive.
 *
 * @param creepName The name of the creep to check
 *
 * @returns A boolean value
 */
function isCreepAlive(creepName: string) {
  return creepName in Game.creeps;
}

/**
 * Returns a boolean value for if the room is visible.
 *
 * @param roomName The name of the room to test
 */
function isRoomVisible(roomName: string) {
  return roomName in Game.rooms;
}

/**
 * Returns true if the object is visible to your code.
 *
 * @param id the id of the object to check
 */
function isObjectVisible<T extends _HasId>(id: Id<T>) {
  return !!Game.getObjectById(id);
}

/**
 * Returns true if the room has a controller and is yours.
 *
 * @param roomName A `Room` or the name of a room.
 */
function isMyRoom(roomName: string | Room) {
  let room: Room;

  if (typeof roomName === "string") {
    if (!isRoomVisible(roomName)) {
      return false;
    }

    room = Game.rooms[roomName];
  } else {
    room = roomName;
  }

  if (!room.controller) {
    return false;
  }

  return room.controller.my;
}

/**
 * Counts the number of `countPart` the creep has.
 *
 * @param creep The creep to count body parts of.
 * @param countPart The BodyPartConstant to count.
 */
function countBodyPart(creep: Creep, countPart: BodyPartConstant) {
  return creep.body.filter(part => {
    return part.type === countPart;
  }).length;
}

/**
 * Checks the given creep for the body part requested.
 *
 * @param creep The creep to check.
 * @param hasPart The BodyPart to check for.
 */
function hasBodyPart(creep: Creep, hasPart: BodyPartConstant) {
  return countBodyPart(creep, hasPart) > 0;
}

/**
 * Returns true if in the simulator.
 */
function isSimulation() {
  return isRoomVisible("sim");
}

/**
 * Returns an array of all your rooms. See `isMyRoom`
 *
 * Uses `cacheInTick` to reduce the number of iterations on sunsequent calls.
 */
function myRooms() {
  return cacheInTick("_fns_my_rooms", () => {
    const rooms: Room[] = [];

    Object.keys(Game.rooms).forEach(roomName => {
      if (isMyRoom(roomName)) {
        rooms.push(Game.rooms[roomName]);
      }
    });

    return rooms;
  });
}

/**
 * Finds all the sources in a room and caches the result with `cacheInTick`
 *
 *
 * @param room The room to find sources in.
 */
function sourcesInRoom(room: Room) {
  return cacheInTick(`_fns_sources_in_room_${room.name}`, () => {
    return room.find(FIND_SOURCES);
  });
}

function getSpawnsInRoom(room: Room) {
  if (room.controller?.my) {
    const maxspawns = CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][room.controller.level];
    const spawns = room.find(FIND_MY_SPAWNS, {
      filter: (s: AnyStructure, i: number, c: AnyStructure[]) =>
        c.length <= maxspawns || s.isActive()
    });
    return spawns;
  }
  return [];
}
function spawnsInRoom(room: Room): StructureSpawn[] {
  return cacheInTick<StructureSpawn[]>(`_cached_spawns_in_room_${room.name}`, () => {
    return getSpawnsInRoom(room);
  });
}

/**
 * Calculate the effectiveness of a tower at the given range
 *
 * @param range The range to calculate effectiveness at e.g. `tower.pos.getRangeTo(target)`
 * @param max The power of the tower, e.g. `TOWER_POWER_ATTACK`
 */
function towerEffectivenessAtRange(range: number, max: number): number {
  if (range <= TOWER_OPTIMAL_RANGE) {
    return max;
  }
  if (range >= TOWER_FALLOFF_RANGE) {
    return max * (1 - TOWER_FALLOFF);
  }

  const towerFalloffPerTile = TOWER_FALLOFF / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);

  return max * (1 - (range - TOWER_OPTIMAL_RANGE) * towerFalloffPerTile);
}

export {
  cacheInTick,
  clearDeadCreepsFromMemory,
  countBodyPart,
  deflate,
  hasBodyPart,
  inflate,
  isCreepAlive,
  isMyRoom,
  isObjectVisible,
  isRoomVisible,
  isSimulation,
  myRooms,
  objectFromId,
  objectsFromIds,
  sourcesInRoom,
  spawnsInRoom,
  towerEffectivenessAtRange
};
