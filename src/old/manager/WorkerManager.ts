import { maxRolePopulation, Role, roleNames } from "../../slowdeath/creepActions/constants";
import { Upgrader } from "../../slowdeath/creepActions/Upgrader";
import { logger } from "../../utils/logger";

import { Manager } from "./Manager";

export class WorkerManager extends Manager {
  public spawns: StructureSpawn[] = [];
  public myCreeps: Creep[] = [];
  public sources: Source[] = [];

  public numHarversters = 0;
  public numBuilders = 0;
  public numHaulers = 0;
  public numUpgraders = 0;
  public numContinuousHarvesters = 0;
  public room!: Room;

  public init = (room: Room): void => {


    // var energyAvailable = room.energyAvailable;
    const energyAvailable: number = room.energyCapacityAvailable;

    this.creapCreator(room, energyAvailable); // Early returns are possible in this function, so be careful in putting code below.
  };

  public run = (): void => {};

  public createCreep = (energyAvailable: number, role: Role): ScreepsReturnCode => {
    //var body = getBody();
    if (this.spawns.length < 1) return ERR_RCL_NOT_ENOUGH;
    const body: BodyPartConstant[] = this.getBody(energyAvailable, role);

    const ret: ScreepsReturnCode = this.spawns[0].spawnCreep(body, roleNames[role] + Game.time, {
      memory: { role: role }
    });
    console.log(
      "Creep creation with body:" + body + " role: " + roleNames[role] + " result: " + ret
    );
    logger.info(`Creep creation with body:${body} role: ${roleNames[role]} result: ${ret}`);

    return ret;
  };



  private createContinuousHarvester(energyAvailable: number): ScreepsReturnCode {
    if (
      this.numContinuousHarvesters < maxRolePopulation.continuousHarvester &&
      energyAvailable >= 350
    ) {
      const res = this.createCreep(energyAvailable, Role.ROLE_CONTINUOUS_HARVESTER);
      if (res === ERR_NOT_ENOUGH_ENERGY) {
        logger.warning(
          "skipping creation of creeps till energy for continuous harvesters is available"
        );
      }
      return res;
    }
    return ERR_RCL_NOT_ENOUGH;
  }

}
