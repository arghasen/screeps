import stubCreep, { CreepOptions } from "./creep";
import stubRoom, { StubRoomOptions } from "./room";
import stubConstants from "./constants";
import stubGame from "./game";
import stubMemory from "./memory";

interface StubOptions {
  creeps?: CreepOptions[];
  rooms: { [roomName: string]: StubRoomOptions };
}

export default function stub(options: StubOptions) {
  stubConstants();
  stubMemory();

  let creeps: Creep[] = [];
  let rooms: Room[] = [];

  if (options.creeps) {
    creeps = options.creeps.map(stubCreep);
  }

  if (options.rooms) {
    rooms = Object.keys(options.rooms).map(name => stubRoom(name, options.rooms[name]));
  }

  stubGame({
    creeps,
    rooms
  });
}
