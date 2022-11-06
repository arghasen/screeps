export class Claimer {
  public static run = (creep: Creep): void => {
    if (creep.memory.targetRoom && creep.memory.targetRoom !== creep.room.name) {
      const target = new RoomPosition(25, 25, creep.memory.targetRoom);

      creep.moveTo(target);
    } else {
      if (creep.room.controller) {
        if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller);
        }
      }
    }
  };
}
