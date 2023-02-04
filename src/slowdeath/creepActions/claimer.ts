import { moveToOtherRoom } from "./CommonActions";

export class Claimer {
  public static run = (creep: Creep): void => {
    if (creep.memory.moveLoc) {
      moveToOtherRoom(creep, creep.memory.moveLoc);
    } else {
      if (creep.room.controller) {
        if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller);
        }
      }
    }
  };
}
