import { ControllerConsts, RoadStatus, extensionLoc } from "../creepActions/constants";
import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import spawnsInRoom from "../../utils/spawns-in-room";
import isCreepAlive from "utils/is-creep-alive";

export class Infrastructure extends Process {
  protected className = "infrastructure";
  private metadata?: CityData;
  private extensionsUnderConstruction: ConstructionSite[] = [];
  private extensionsCreated: AnyOwnedStructure[] = [];
  private buildMoreRoads = true;
  private spawns: StructureSpawn[] = [];
  private room!: Room;

  public main() {
    this.init();

    if (this.room.controller?.my) {
      this.requestRemoteBuilders(this.room.controller.pos);
      if (this.room.controller.level === 2) {
        this.createExtensions(this.room, this.spawns[0].pos, 2);
      }
      if (this.room.controller.level === 3) {
        const pos = this.room.getPositionAt(this.spawns[0].pos.x + 10, this.spawns[0].pos.y + 10);
        if (pos) {
          this.createExtensions(this.room, pos, 3);
        }
      }
    }

    if (this.buildMoreRoads) {
      this.buildRoadsToSpawn(this.room);
      this.buildRoadsToController(this.room);
    }
  }

  private requestRemoteBuilders(pos: RoomPosition) {
    logger.info("Spawn lenght:", this.spawns.length);
    if (this.spawns.length === 0) {
      const builderData = {
        sent: "",
        moveLoc: {
          x: pos.x,
          y: pos.y,
          roomName: this.room.name
        }
      };

      if (Memory.needBuilder) {
        const sent = Memory.needBuilder.sent;
        if (sent === "" || !isCreepAlive(sent)) {
          Memory.needBuilder = builderData;
        }
      } else {
        Memory.needBuilder = builderData;
      }
    }
  }

  private buildRoadsToController(room: Room) {
    if (Memory.roadsDone === RoadStatus.TO_SOURCES) {
      if (room.controller) {
        this.buildRoads(room, room.controller);
      }
      Memory.roadsDone = RoadStatus.BUILDING_TO_CONTROLLER;
    }
    if (this.buildMoreRoads && Memory.BUILDING_TO_SOURCES) {
      Memory.roadsDone = RoadStatus.TO_SOURCES;
    }
  }

  private buildRoads(room: Room, to: Structure) {
    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
      const path = to.pos.findPathTo(source.pos, {
        range: 1,
        ignoreCreeps: true
      });
      if (path) {
        // create in reverse so u are closer to the source
        for (const p of path.reverse()) {
          room.createConstructionSite(p.x, p.y, STRUCTURE_ROAD);
        }
      }
    }
  }

  private buildRoadsToSpawn(room: Room) {
    if (Memory.roadsDone === RoadStatus.NONE) {
      this.buildRoads(room, this.spawns[0]);
      Memory.roadsDone = RoadStatus.BUILDING_TO_SOURCES;
      return;
    }
    if (this.buildMoreRoads && Memory.BUILDING_TO_SOURCES) {
      Memory.roadsDone = RoadStatus.TO_SOURCES;
    }
  }

  private init() {
    this.metadata = this.data as CityData;
    this.room = Game.rooms[this.metadata.roomName];
    this.spawns = spawnsInRoom(this.room);
    const myStructures = this.room.find(FIND_MY_STRUCTURES);
    this.extensionsCreated = myStructures.filter(
      structure => structure.structureType === STRUCTURE_EXTENSION
    );

    const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
    this.extensionsUnderConstruction = constructionSites.filter(
      site => site.structureType === STRUCTURE_EXTENSION
    );

    const roadsUnderConstruction = constructionSites.filter(
      site => site.structureType === STRUCTURE_ROAD
    );
    this.buildMoreRoads = roadsUnderConstruction.length === 0;
    logger.info(`${this.className}: Starting infrastructure for ${this.metadata.roomName}`);
  }

  private getTotalExtensions(): number {
    return this.extensionsUnderConstruction.length + this.extensionsCreated.length;
  }

  private createExtensions(room: Room, pos: RoomPosition, level: number) {
    const loc = _.cloneDeep(extensionLoc[2]);
    for (
      let i: number = this.getTotalExtensions();
      i < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][level];
      i++
    ) {
      console.log(loc);
      const res: ScreepsReturnCode = room.createConstructionSite(
        pos.x + loc[i % loc.length][0],
        pos.y + loc[i % loc.length][1],
        STRUCTURE_EXTENSION
      );
      console.log("result for creation", res);
      if (res !== 0) {
        loc.splice(i, 1);
        --i;
      }
    }
  }
}
