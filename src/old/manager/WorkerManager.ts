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



  private getBody(energyAvailable: number, role: Role): BodyPartConstant[] {
    let body: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE];
    if (energyAvailable === 250 || energyAvailable === 300) {
      body = [WORK, CARRY, MOVE, MOVE];
    }
    if (energyAvailable === 350) {
      body = [WORK, WORK, CARRY, CARRY, MOVE];
    }
    if (energyAvailable >= 500 && role === Role.ROLE_UPGRADER) {
      body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
    }
    if (role === Role.ROLE_CONTINUOUS_HARVESTER) {
      body = this.getContinuousHarvesterBody(energyAvailable);
    }

    if (role === Role.ROLE_HAULER) {
      body = this.getHaulerBody(energyAvailable);
    }
    if (role === Role.ROLE_BUILDER) {
      if (Memory.focus === "build" && energyAvailable >= 550) {
        body = [WORK, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, CARRY, MOVE];
      } else {
        body = [WORK, CARRY, CARRY, MOVE];
      }
    }
    return body;
  }

  private getHaulerBody(energyAvailable: number): BodyPartConstant[] {
    let body: BodyPartConstant[] = [];
    if (energyAvailable === 300) {
      body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    } else if (energyAvailable === 400) {
      body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    } else if (energyAvailable >= 500) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
    return body;
  }

  private getContinuousHarvesterBody(energyAvailable: number): BodyPartConstant[] {
    let body: BodyPartConstant[] = [];
    if (energyAvailable === 350 || energyAvailable === 400) {
      body = [WORK, WORK, WORK, MOVE];
    } else if (energyAvailable === 450 || energyAvailable === 500) {
      body = [WORK, WORK, WORK, WORK, MOVE];
    } else if (energyAvailable >= 550) {
      body = [WORK, WORK, WORK, WORK, WORK, MOVE];
    }
    return body;
  }

  private creapCreator(room: Room, energyAvailable: number) {
    if (this.spawns[0] && !this.spawns[0].spawning) {

      this.populationBasedCreepCreator(energyAvailable);
    }
  }

  private populationBasedCreepCreator(energyAvailable: number): void {
    const ret = this.createContinuousHarvester(energyAvailable);
    if (ret === OK || ret === ERR_NOT_ENOUGH_ENERGY) {
      return;
    }
  }

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
      if (res === OK) {
        Memory.count = Memory.count + 1;
      }
      return res;
    }
    return ERR_RCL_NOT_ENOUGH;
  }

}
