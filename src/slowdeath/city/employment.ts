import { Builder } from "../creepActions/Builder";
import { ContinuousHarvester } from "../creepActions/ContinuousHarvester";
import { Harvester } from "../creepActions/Harvester";
import { Hauler } from "../creepActions/Hauler";
import { Process } from "../../os/process";
import { Role } from "../creepActions/constants";
import { Upgrader } from "../creepActions/Upgrader";
import { logger } from "../../utils/logger";

export class Employment extends Process {
  protected className = "employment";
  public myCreeps: Creep[] = [];
  public sources: Source[] = [];
  public room!: Room;
  private metadata?: CityData;

  public main() {
    this.metadata = this.data as CityData;
    // this.room = this.metadata.roomName;
    logger.info(`${this.className}: Starting employment`);
    this.myCreeps = _.values(Game.creeps);

    for (const creep of this.myCreeps) {
      switch (creep.memory.role) {
        case Role.ROLE_HARVESTER:
          Harvester.run(creep);
          break;
        case Role.ROLE_HAULER:
          Hauler.run(creep);
          break;
        case Role.ROLE_BUILDER:
          Builder.run(creep);
          break;
        case Role.ROLE_UPGRADER:
          Upgrader.run(creep);
          break;
        case Role.ROLE_CONTINUOUS_HARVESTER:
          ContinuousHarvester.run(creep);
          break;

        default:
          _.noop();
      }
    }
  }
}
