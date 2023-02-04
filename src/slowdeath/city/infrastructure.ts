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
  private towers: StructureTower[] = []
  private constructionSites: ConstructionSite<BuildableStructureConstant>[] = [];

  private init() {
    this.metadata = this.data as CityData;
    this.room = Game.rooms[this.metadata.roomName];

    if (this.room) {
      this.spawns = spawnsInRoom(this.room);
      const myStructures = this.room.find(FIND_MY_STRUCTURES);
      this.extensionsCreated = myStructures.filter(
        structure => structure.structureType === STRUCTURE_EXTENSION
      );

      this.constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
      this.extensionsUnderConstruction = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_EXTENSION }
      });

      const roadsUnderConstruction = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_ROAD }
      });

      this.towers = this.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
      });

      const linksCreated = myStructures.filter(structure => structure.structureType === STRUCTURE_LINK);
      logger.debug(`links: ${linksCreated}`);
      if (linksCreated.length >= 3) {
        this.room.memory.linksCreated = true;
        if (this.room.controller && this.room.controller.level >= 5) {
          const upgraderLink = this.room.controller.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
          this.room.memory.upgraderLink = upgraderLink?.id as Id<StructureLink>;
        }
      }
      else {
        this.room.memory.linksCreated = false;
      }
      this.buildMoreRoads = roadsUnderConstruction.length === 0;
      logger.info(`${this.className}: Starting infrastructure for ${this.metadata.roomName}`);
    }
  }

  private requestExtraBuilders() {
    if (this.constructionSites.length > 1) {
      this.room.memory.extraBuilders = true;
    } else {
      this.room.memory.extraBuilders = false;
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

  public main() {
    this.init();

    if (!this.room) {
      return;
    }

    if (this.room.controller?.my) {
      this.requestRemoteBuilders(this.room.controller.pos);
      this.requestExtraBuilders();
      this.buildExtensions();
      this.buildTowers();
      this.buildStorage();

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
  private checkStatus(status: RoadStatus) {
    return this.room.memory.roadsDone === status;
  }

  private setStatus(status: RoadStatus) {
    this.room.memory.roadsDone = status;
  }

  private updateStatusToDone(from: RoadStatus, to: RoadStatus) {
    if (this.buildMoreRoads && this.checkStatus(from)) {
      this.setStatus(to);
    }
  }

  private buildExtensions() {
    if (this.room.controller!.level === 2) {
      this.createExtensions(this.room, this.spawns[0].pos, 2);
    }
    if (this.room.controller!.level === 3) {
      const pos = this.room.getPositionAt(this.spawns[0].pos.x + 5, this.spawns[0].pos.y - 5);
      if (pos) {
        this.createExtensions(this.room, pos, 3);
      }
    }
  }

  private buildTowers() {
    if (this.room.controller!.level >= 3) {
      if (this.towers.length < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][this.room.controller!.level]) {
        logger.info("time to build a tower");
        const towerPos = getTowerPosition(this.room.name, this.towers);
        if (towerPos) {
          this.room.createConstructionSite(towerPos, STRUCTURE_TOWER);
          this.buildRoadsFromSource(this.room, towerPos);
        }
        else {
          logger.warning(" tower position is invalid");
        }
      }
    }

    function getTowerPosition(roomName: string, towers: StructureTower[]) {
      if(towers.length == 0){
        return new RoomPosition(25, 25, roomName);
      } else if(towers.length == 1){
        return new RoomPosition(15, 20, roomName);
      } else if(towers.length == 2){
        return new RoomPosition(30, 20, roomName);
      }
      return null;
    }
  }

  private buildStorage() {
    if (this.room.controller!.level === 4) {
      const pos = this.room.getPositionAt(this.spawns[0].pos.x - 5, this.spawns[0].pos.y);
      if (pos) {
        const ret = this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_STORAGE);
      }
    }
  }

  private buildMoreRoadsToStorage(room: Room) {
    if (this.checkStatus(RoadStatus.TO_LVL3EXT)) {
      const pos = this.room.storage?.pos;
      this.buildRoadsFromSource(room, pos);
      this.setStatus(RoadStatus.BUILDING_TO_STORAGE);
    }
    this.updateStatusToDone(RoadStatus.BUILDING_TO_STORAGE, RoadStatus.TO_STORAGE);
  }

  private buildRoadsToLvl3Extenstions(room: Room) {
    if (this.checkStatus(RoadStatus.TO_CONTROLLER)) {
      for (const extension of this.extensionsCreated) {
        this.buildRoadsFromSource(room, extension.pos);
      }
      this.setStatus(RoadStatus.BUILDING_TO_LVL3EXT);
    }
    this.updateStatusToDone(RoadStatus.BUILDING_TO_LVL3EXT, RoadStatus.TO_LVL3EXT);
  }

  private buildRoadsToController(room: Room) {
    if (this.room.memory.roadsDone === RoadStatus.TO_SOURCES) {
      if (room.controller) {
        this.buildRoadsFromSource(room, room.controller.pos);
      }
      this.setStatus(RoadStatus.BUILDING_TO_CONTROLLER);
    }
    this.updateStatusToDone(RoadStatus.BUILDING_TO_CONTROLLER, RoadStatus.TO_CONTROLLER);
  }

  private buildRoadsFromSource(room: Room, pos: RoomPosition | undefined) {
    if (pos) {
      const sources = room.find(FIND_SOURCES);
      for (const source of sources) {
        this.buildRoadByPath(source.pos, pos);
      }
    }
  }

  private buildRoadByPath(source: RoomPosition, dest: RoomPosition) {
    const path = source.findPathTo(dest, {
      range: 1,
      ignoreCreeps: true
    });
    if (path) {
      for (const p of path) {
        this.room.createConstructionSite(p.x, p.y, STRUCTURE_ROAD);
      }
    }
  }

  private buildRoadsToSpawn(room: Room) {
    if (this.checkStatus(RoadStatus.NONE)) {
      this.buildRoadsFromSource(room, this.spawns[0].pos);
      this.setStatus(RoadStatus.BUILDING_TO_SOURCES);
    }
    this.updateStatusToDone(RoadStatus.BUILDING_TO_SOURCES, RoadStatus.TO_SOURCES);
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
      console.log(`${i} ${loc}`);
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
      if (loc.length == 0) {
        break;
      }
    }
  }
}
