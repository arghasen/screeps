import { ControllerConsts, extensionLoc } from "../creepActions/constants";
import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import spawnsInRoom from "../../utils/spawns-in-room";

export class Infrastructure extends Process {
  protected className = "infrastructure";
  private metadata?: CityData;
  private extensionsUnderConstruction: ConstructionSite[] = [];
  private extensionsCreated: AnyOwnedStructure[] = [];
  private spawns: StructureSpawn[] = [];
  public main() {
    this.metadata = this.data as CityData;
    this.spawns = spawnsInRoom(Game.rooms[this.metadata.roomName]);
    logger.info(`${this.className}: Starting infrastructure for ${this.metadata.roomName}`);
  }

  private getTotalExtensions(): number {
    return this.extensionsUnderConstruction.length + this.extensionsCreated.length;
  }

  private createExtensions(room: Room) {
    const loc = _.cloneDeep(extensionLoc[2]);
    for (let i: number = this.getTotalExtensions(); i < ControllerConsts.lvl2extensions; i++) {
      console.log(loc);
      const res: ScreepsReturnCode = room.createConstructionSite(
        this.spawns[0].pos.x + loc[i][0],
        this.spawns[0].pos.y + loc[i][1],
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
