import { sourcesInRoom } from "utils/screeps-fns";
import { Process } from "../os/process";
import { logger } from "../utils/logger";
import { RoadStatus } from "./creepActions/constants";

/**
 * City is the lowest level of an empire and is responsible for individual cities
 */
export class City extends Process {
  protected className = "city";
  private metadata?: CityData;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting city for ${this.metadata.roomName}`);
    const room = Game.rooms[this.metadata.roomName];
    if (room && room.controller?.my) {
      this.setupMemoryForRoom(room);

      this.launchChildProcess(`infrastructure-${this.metadata.roomName}`, "infrastructure", {
        roomName: this.metadata.roomName
      });
      this.launchChildProcess(`employment-${this.metadata.roomName}`, "employment", {
        roomName: this.metadata.roomName
      });
      this.launchChildProcess(`military-${this.metadata.roomName}`, "military", {
        roomName: this.metadata.roomName
      });
      this.launchChildProcess(`spawns-${this.metadata.roomName}`, "spawns", {
        roomName: this.metadata.roomName
      });

      if (!room.memory.rcl[room.controller.level]) {
        room.memory.rcl[room.controller.level] = Game.time;
      }
    }
  }

  private setupMemoryForRoom(room: Room) {
    if (!room.memory.rcl) {
      room.memory.rcl = {};
    }
    if (!room.memory.setup) {
      room.memory = {
        setup: true,
        roadsDone: RoadStatus.NONE,
        continuousHarvesterCount: 0,
        continuousHarvestingStarted: false,
        createContinuousHarvester: false,
        critical: false,
        linksCreated: false,
        upgraderLink: undefined,
        harvesterStartTime: {},
        extraBuilders: false,
        spawnQueue: [],
        rcl: {},
        remoteMining: {
          creepCost: 0,
          energyHarvested: 0,
          energyTransferred: 0,
          rooms: []
        },
        mineMinerals: false,
        energyContainers: [],
        enemy: false,
        heal: []
      };
      const sources = sourcesInRoom(room);
      for (const source of sources) {
        room.memory.harvesterStartTime[source.id] = [];
      }
    }
    if (!room.memory.heal) {
      room.memory.heal = [];
    }
  }
}
