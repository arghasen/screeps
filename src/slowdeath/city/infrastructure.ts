import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import {
  calculateExtensionPositions,
  RoadStatus,
  ControllerConsts
} from "../creepActions/constants";
import { isCreepAlive, spawnsInRoom } from "utils/screeps-fns";

export class Infrastructure extends Process {
  protected className = "infrastructure";
  private metadata?: CityData;
  private extensionsUnderConstruction: ConstructionSite[] = [];
  private extensionsCreated: AnyOwnedStructure[] = [];
  private buildMoreRoads = true;
  private spawns: StructureSpawn[] = [];
  private room!: Room;
  private towers: StructureTower[] = [];
  private constructionSites: ConstructionSite<BuildableStructureConstant>[] = [];
  private links: StructureLink[] = [];

  private init() {
    this.metadata = this.data as CityData;
    this.room = Game.rooms[this.metadata.roomName];

    if (this.room) {
      this.spawns = spawnsInRoom(this.room);
      const myStructures = this.room.find(FIND_MY_STRUCTURES);

      // Track all structures
      this.extensionsCreated = myStructures.filter(
        structure => structure.structureType === STRUCTURE_EXTENSION
      );
      this.towers = myStructures.filter(
        structure => structure.structureType === STRUCTURE_TOWER
      ) as StructureTower[];
      this.links = myStructures.filter(
        structure => structure.structureType === STRUCTURE_LINK
      ) as StructureLink[];

      this.constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
      this.extensionsUnderConstruction = this.constructionSites.filter(
        site => site.structureType === STRUCTURE_EXTENSION
      );

      const roadsUnderConstruction = this.constructionSites.filter(
        site => site.structureType === STRUCTURE_ROAD
      );

      this.buildMoreRoads = roadsUnderConstruction.length === 0;
      logger.debug(`${this.className}: Starting infrastructure for ${this.metadata.roomName}`);
    }
  }

  private requestExtraBuilders() {
    // Prioritize construction sites based on importance
    const prioritySites = this.constructionSites.filter(
      site =>
        site.structureType === STRUCTURE_TOWER ||
        site.structureType === STRUCTURE_STORAGE ||
        site.structureType === STRUCTURE_EXTENSION
    );

    this.room.memory.extraBuilders = prioritySites.length > 1;
  }

  private requestRemoteBuilders(pos: RoomPosition) {
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

      // Build structures in priority order
      this.buildExtensions();
      this.buildTowers();
      this.buildStorage();
      this.buildLinks();

      if (this.spawns.length > 0 && this.constructionSites.length === 0) {
        if (this.buildMoreRoads) {
          this.buildOptimizedRoadNetwork();
        }
      }
    }
  }

  private buildOptimizedRoadNetwork() {
    // Build roads in order of importance
    if (this.checkStatus(RoadStatus.NONE)) {
      // First connect sources to spawn
      this.buildRoadsFromSource(this.room, this.spawns[0].pos);
      this.setStatus(RoadStatus.BUILDING_TO_SOURCES);
    }

    if (this.checkStatus(RoadStatus.TO_SOURCES)) {
      // Then connect controller
      if (this.room.controller) {
        this.buildRoadsFromSource(this.room, this.room.controller.pos);
      }
      this.setStatus(RoadStatus.BUILDING_TO_CONTROLLER);
    }

    if (this.checkStatus(RoadStatus.TO_CONTROLLER)) {
      // Then connect extensions
      for (const extension of this.extensionsCreated) {
        this.buildRoadsFromSource(this.room, extension.pos);
      }
      this.setStatus(RoadStatus.BUILDING_TO_LVL3EXT);
    }

    if (this.checkStatus(RoadStatus.TO_LVL3EXT) && this.room.storage) {
      // Finally connect storage
      this.buildRoadsFromSource(this.room, this.room.storage.pos);
      this.setStatus(RoadStatus.BUILDING_TO_STORAGE);
    }
  }

  private buildRoadsFromSource(room: Room, pos: RoomPosition | undefined) {
    if (!pos) return;

    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
      // Use PathFinder for optimal road placement
      const path = PathFinder.search(source.pos, pos, {
        plainCost: 2,
        swampCost: 10,
        roomCallback: (roomName: string) => {
          const targetRoom = Game.rooms[roomName];
          if (!targetRoom) return false;

          const costs = new PathFinder.CostMatrix();

          // Avoid existing roads and structures
          targetRoom.find(FIND_STRUCTURES).forEach(struct => {
            if (struct.structureType === STRUCTURE_ROAD) {
              costs.set(struct.pos.x, struct.pos.y, 1);
            } else if (
              struct.structureType !== STRUCTURE_CONTAINER &&
              (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
            ) {
              costs.set(struct.pos.x, struct.pos.y, 0xff);
            }
          });

          return costs;
        }
      });

      // Place roads along the path
      for (const step of path.path) {
        this.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
      }
    }
  }

  private buildTowers() {
    if (!this.room.controller || this.room.controller.level < 3) return;

    const maxTowers = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][this.room.controller.level];
    if (this.towers.length >= maxTowers) return;

    const towerPos = this.findOptimalTowerPosition();
    if (towerPos) {
      this.room.createConstructionSite(towerPos, STRUCTURE_TOWER);
      console.log(`${this.className}: Building tower at ${towerPos.toString()}`);
      this.buildRoadsFromSource(this.room, towerPos);
    }
  }

  private findOptimalTowerPosition(): RoomPosition | null {
    // Find position that covers important structures and resources
    const importantPositions = [
      this.room.controller?.pos,
      this.room.storage?.pos,
      ...this.spawns.map(spawn => spawn.pos),
      ...this.extensionsCreated.map(ext => ext.pos)
    ].filter((pos): pos is RoomPosition => pos !== undefined);

    if (importantPositions.length === 0) return null;

    // Try different positions and evaluate coverage
    const positions = [
      new RoomPosition(25, 25, this.room.name),
      new RoomPosition(15, 20, this.room.name),
      new RoomPosition(30, 20, this.room.name),
      new RoomPosition(20, 25, this.room.name),
      new RoomPosition(25, 20, this.room.name)
    ];

    return positions.reduce((best, pos) => {
      if (!best) return pos;

      const bestCoverage = this.calculateTowerCoverage(best, importantPositions);
      const currentCoverage = this.calculateTowerCoverage(pos, importantPositions);

      return currentCoverage > bestCoverage ? pos : best;
    }, null as RoomPosition | null);
  }

  private calculateTowerCoverage(towerPos: RoomPosition, targets: RoomPosition[]): number {
    return targets.reduce((score, target) => {
      const range = towerPos.getRangeTo(target);
      if (range <= 5) return score + 3;
      if (range <= 10) return score + 2;
      if (range <= 15) return score + 1;
      return score;
    }, 0);
  }

  private buildStorage() {
    if (!this.room.controller || this.room.controller.level !== 4) return;

    if (!this.room.storage) {
      const storagePos = this.findOptimalStoragePosition();
      if (storagePos) {
        this.room.createConstructionSite(storagePos.x, storagePos.y, STRUCTURE_STORAGE);
      }
    }
  }

  private findOptimalStoragePosition(): RoomPosition | null {
    if (!this.spawns[0]) return null;

    // Try positions around spawn
    const positions = [
      new RoomPosition(this.spawns[0].pos.x - 5, this.spawns[0].pos.y, this.room.name),
      new RoomPosition(this.spawns[0].pos.x + 5, this.spawns[0].pos.y, this.room.name),
      new RoomPosition(this.spawns[0].pos.x, this.spawns[0].pos.y - 5, this.room.name),
      new RoomPosition(this.spawns[0].pos.x, this.spawns[0].pos.y + 5, this.room.name)
    ];

    return positions.reduce((best, pos) => {
      if (!best) return pos;

      const bestScore = this.calculateStorageScore(best);
      const currentScore = this.calculateStorageScore(pos);

      return currentScore > bestScore ? pos : best;
    }, null as RoomPosition | null);
  }

  private calculateStorageScore(pos: RoomPosition): number {
    let score = 0;

    // Prefer positions near spawn
    const spawnDist = pos.getRangeTo(this.spawns[0].pos);
    score += 10 - spawnDist;

    // Prefer positions near controller
    if (this.room.controller) {
      const controllerDist = pos.getRangeTo(this.room.controller.pos);
      score += 10 - controllerDist;
    }

    // Prefer positions near extensions
    score += this.extensionsCreated.reduce((sum, ext) => sum + (10 - pos.getRangeTo(ext.pos)), 0);

    // Avoid positions near walls
    const wallDist = Math.min(pos.x, pos.y, 50 - pos.x, 50 - pos.y);
    score += wallDist;

    return score;
  }

  private buildLinks() {
    if (!this.room.controller || this.room.controller.level < 5) return;

    const maxLinks = CONTROLLER_STRUCTURES[STRUCTURE_LINK][this.room.controller.level];
    if (this.links.length >= maxLinks) return;

    // At level 5, place links next to sources
    if (this.room.controller.level === 5) {
      const sources = this.room.find(FIND_SOURCES);
      for (const source of sources) {
        if (this.links.length >= maxLinks) break;

        const linkPos = this.findOptimalLinkPosition(source.pos);
        if (linkPos) {
          this.room.createConstructionSite(linkPos.x, linkPos.y, STRUCTURE_LINK);
        }
      }
    }
  }

  private findOptimalLinkPosition(sourcePos: RoomPosition): RoomPosition | null {
    // Try all 8 positions around source
    const positions = [
      new RoomPosition(sourcePos.x - 1, sourcePos.y - 1, this.room.name), // TOP_LEFT
      new RoomPosition(sourcePos.x, sourcePos.y - 1, this.room.name), // TOP
      new RoomPosition(sourcePos.x + 1, sourcePos.y - 1, this.room.name), // TOP_RIGHT
      new RoomPosition(sourcePos.x + 1, sourcePos.y, this.room.name), // RIGHT
      new RoomPosition(sourcePos.x + 1, sourcePos.y + 1, this.room.name), // BOTTOM_RIGHT
      new RoomPosition(sourcePos.x, sourcePos.y + 1, this.room.name), // BOTTOM
      new RoomPosition(sourcePos.x - 1, sourcePos.y + 1, this.room.name), // BOTTOM_LEFT
      new RoomPosition(sourcePos.x - 1, sourcePos.y, this.room.name) // LEFT
    ];

    // Return first position that doesn't have a structure, isn't on a wall, and isn't on wall terrain
    return (
      positions.find(pos => {
        // Check if position is on a wall
        if (pos.x === 0 || pos.x === 49 || pos.y === 0 || pos.y === 49) {
          return false;
        }
        // Check if position has any structures
        if (this.room.lookForAt(LOOK_STRUCTURES, pos).length > 0) {
          return false;
        }
        // Check if position is on wall terrain
        return this.room.lookForAt(LOOK_TERRAIN, pos)[0] !== "wall";
      }) || null
    );
  }

  private buildExtensions() {
    if (!this.room.controller) return;

    const level = this.room.controller.level;
    if (level < 2 || level > 8) return;

    const maxExtensions = ControllerConsts[`lvl${level}extensions`] || 0;
    const currentExtensions = this.getTotalExtensions();

    // If we already have all extensions for this level, don't build more
    if (currentExtensions >= maxExtensions) return;

    // Calculate how many new extensions we need to build
    const extensionsToBuild = maxExtensions - currentExtensions;

    // Get the base position for this level's extensions
    let pos: RoomPosition;
    switch (level) {
      case 2:
        pos = this.spawns[0].pos;
        break;
      case 3:
        pos = new RoomPosition(this.spawns[0].pos.x + 5, this.spawns[0].pos.y - 5, this.room.name);
        break;
      case 4:
        pos = new RoomPosition(this.spawns[0].pos.x - 5, this.spawns[0].pos.y + 5, this.room.name);
        break;
      case 5:
        pos = new RoomPosition(this.spawns[0].pos.x + 5, this.spawns[0].pos.y + 5, this.room.name);
        break;
      case 6:
        pos = new RoomPosition(this.spawns[0].pos.x - 5, this.spawns[0].pos.y - 5, this.room.name);
        break;
      case 7:
        pos = new RoomPosition(this.spawns[0].pos.x + 3, this.spawns[0].pos.y + 3, this.room.name);
        break;
      case 8:
        pos = new RoomPosition(this.spawns[0].pos.x - 3, this.spawns[0].pos.y - 3, this.room.name);
        break;
      default:
        return;
    }

    if (pos) {
      this.createExtensions(this.room, pos, level, currentExtensions, extensionsToBuild);
    }
  }

  private createExtensions(
    room: Room,
    pos: RoomPosition,
    level: number,
    currentExtensions: number,
    extensionsToBuild: number
  ) {
    const loc: number[][] = calculateExtensionPositions(level);
    let builtCount = 0;
    let i = 0;

    while (builtCount < extensionsToBuild && i < loc.length) {
      const res: ScreepsReturnCode = room.createConstructionSite(
        pos.x + loc[i][0],
        pos.y + loc[i][1],
        STRUCTURE_EXTENSION
      );

      if (res === OK) {
        builtCount++;
        i++;
      } else {
        // If we can't build here, remove this position and try the next one
        loc.splice(i, 1);
        // Don't increment i since we want to try the next position that moved into this slot
      }
    }
  }

  private getTotalExtensions(): number {
    return this.extensionsUnderConstruction.length + this.extensionsCreated.length;
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
}
