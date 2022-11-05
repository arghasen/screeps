import cacheInTick from "../cache-in-tick";

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

export default function spawnsInRoom(room: Room): StructureSpawn[] {
  return cacheInTick<StructureSpawn[]>(`_cached_spawns_in_room_${room.name}`, () => {
    return getSpawnsInRoom(room);
  });
}
