import isCreepAlive from "utils/is-creep-alive";
import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import spawnsInRoom from "../../utils/spawns-in-room";
import { extensionLoc, RoadStatus } from "../creepActions/constants";

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

    if (!this.room) {
      return;
    }

    if (this.room.controller?.my) {
      this.requestRemoteBuilders(this.room.controller.pos);
      if (this.room.controller.level === 2) {
        this.createExtensions(this.room, this.spawns[0].pos, 2);
      }
      if (this.room.controller.level === 3) {
        const pos = this.room.getPositionAt(this.spawns[0].pos.x + 5, this.spawns[0].pos.y - 5);
        if (pos) {
          this.createExtensions(this.room, pos, 3);
        }
      }
      if (this.room.controller.level === 4) {
        const pos = this.room.getPositionAt(this.spawns[0].pos.x - 5, this.spawns[0].pos.y);
        if (pos) {
          const ret = this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_STORAGE);
        }
      }

      if (this.spawns.length > 0) {
        logger.info("Build More Roads:", this.buildMoreRoads);
        if (this.buildMoreRoads) {
          this.buildRoadsToSpawn(this.room);
          this.buildRoadsToController(this.room);
          if (this.room.controller.level >= 3) {
            this.buildRoadsToLvl3Extenstions(this.room);
          }
          if (this.room.storage) {
            this.buildMoreRoadsToStorage(this.room);
          }
        }
      }
    }
  }

  private buildMoreRoadsToStorage(room: Room) {
    if (this.room.memory.roadsDone === RoadStatus.TO_LVL3EXT) {
      const pos = this.room.storage?.pos;
      if (pos) {
        this.buildRoads(room, pos);
      }
      this.room.memory.roadsDone = RoadStatus.BUILDING_TO_STORAGE;
    }
    this.updateStatus(RoadStatus.BUILDING_TO_STORAGE, RoadStatus.TO_STORAGE);
  }

  private buildRoadsToLvl3Extenstions(room: Room) {
    if (this.room.memory.roadsDone === RoadStatus.TO_CONTROLLER) {
      for (const extension of this.extensionsCreated) {
        const pos = extension.pos;
        if (pos) {
          this.buildRoads(room, pos);
        }
      }
      this.room.memory.roadsDone = RoadStatus.BUILDING_TO_LVL3EXT;
    }
    this.updateStatus(RoadStatus.BUILDING_TO_LVL3EXT, RoadStatus.TO_LVL3EXT);
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
    if (this.room.memory.roadsDone === RoadStatus.TO_SOURCES) {
      if (room.controller) {
        this.buildRoads(room, room.controller.pos);
      }
      this.room.memory.roadsDone = RoadStatus.BUILDING_TO_CONTROLLER;
    }
    this.updateStatus(RoadStatus.BUILDING_TO_CONTROLLER, RoadStatus.TO_CONTROLLER);
  }

  private buildRoads(room: Room, pos: RoomPosition) {
    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
      const path = pos.findPathTo(source.pos, {
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
    if (this.room.memory.roadsDone === RoadStatus.NONE) {
      this.buildRoads(room, this.spawns[0].pos);
      this.room.memory.roadsDone = RoadStatus.BUILDING_TO_SOURCES;
      return;
    }
    this.updateStatus(RoadStatus.BUILDING_TO_SOURCES, RoadStatus.TO_SOURCES);
  }

  private updateStatus(from: RoadStatus, to: RoadStatus) {
    if (this.buildMoreRoads && this.room.memory.roadsDone === from) {
      this.room.memory.roadsDone = to;
    }
  }

  private init() {
    this.metadata = this.data as CityData;
    this.room = Game.rooms[this.metadata.roomName];

    if (this.room) {
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

      const linksCreated = myStructures.filter(structure =>structure.structureType === STRUCTURE_LINK);
      logger.info(`links: ${linksCreated}`);
      if(linksCreated.length >= 3){
        this.room.memory.linksCreated = true;
        if(this.room.controller && this.room.controller.level>=5){
          const upgraderLink = this.room.controller.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter:{structureType: STRUCTURE_LINK}});
          this.room.memory.upgraderLink = upgraderLink?.id;
        }
      }
      else{
        this.room.memory.linksCreated = false;
      }
      this.buildMoreRoads = roadsUnderConstruction.length === 0;
      logger.info(`${this.className}: Starting infrastructure for ${this.metadata.roomName}`);
    }
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
