/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import stubObject from "./object";

interface StubGameOptions {
  objectsById?: { [id: string]: ReturnType<typeof stubObject> };
  ivm?: boolean;
  cpuLimit?: number;
  rooms?: any[];
  creeps?: Creep[];
}

/**
 * Stubs `Game` for use in tests
 *
 * Takes options that can be used to setup `Game` in a specific way.
 *
 * @param options The options to use for the game state.
 */
export default function stubGame(options: StubGameOptions = {}) {
  const g = global as any;

  g.Game = {
    cpu: {
      limit: options.cpuLimit ? options.cpuLimit : 20
    },
    creeps: {},
    getObjectById: (id: string) => {
      return options.objectsById ? options.objectsById[id] : null;
    },
    rooms: {}
  };

  if (options.rooms) {
    options.rooms.forEach(room => {
      g.Game.rooms[room.name] = room;
    });
  }

  if (options.creeps) {
    options.creeps.forEach(creep => {
      g.Game.creeps[creep.name] = creep;
    });
  }

  if (options.ivm) {
    g.Game.cpu.getHeapStatistics = () => {
      return {};
    };
  }
}
