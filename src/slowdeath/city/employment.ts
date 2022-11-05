import { Builder } from "../creepActions/Builder";
import { ContinuousHarvester } from "../creepActions/ContinuousHarvester";
import { Harvester } from "../creepActions/Harvester";
import { Hauler } from "../creepActions/Hauler";
import { Process } from "../../os/process";
import { MaxRolePopulation, Role } from "../creepActions/constants";
import { Upgrader } from "../creepActions/Upgrader";
import { logger } from "../../utils/logger";

export class Employment extends Process {
  protected className = "employment";
  private myCreeps: Creep[] = [];
  private sources: Source[] = [];
  private numHarversters = 0;
  private numBuilders = 0;
  private numHaulers = 0;
  private numUpgraders = 0;
  private numContinuousHarvesters = 0;
  private unemployed: Creep[] = [];
  private room!: Room;
  private metadata?: CityData;

  public main() {
    this.metadata = this.data as CityData;
    this.room = Game.rooms[this.metadata.roomName];
    logger.info(`${this.className}: Starting employment in ${this.metadata.roomName}`);
    this.myCreeps = _.values(Game.creeps);

    this.runCreepActions();
    this.getWorkerCounts();
    if (this.unemployed.length > 0) {
      this.populationBasedEmployer();
    }
  }

  private populationBasedEmployer() {
    const totWorkers =
      this.numBuilders +
      this.numHarversters +
      this.numUpgraders +
      this.numHaulers +
      this.unemployed.length;
    const scale = Math.max(Math.floor(totWorkers / MaxRolePopulation.total), 1);

    if (employ(this.numHarversters, MaxRolePopulation.harvesters)) {
      this.assignRole(Role.ROLE_HARVESTER);
    } else if (
      employ(this.numHaulers, MaxRolePopulation.haulers) &&
      Memory.continuousHarvestingStarted
    ) {
      this.assignRole(Role.ROLE_HAULER);
    } else if (employ(this.numBuilders, MaxRolePopulation.builders)) {
      this.assignRole(Role.ROLE_BUILDER);
    } else if (employ(this.numUpgraders, MaxRolePopulation.upgrader)) {
      this.assignRole(Role.ROLE_UPGRADER);
    }

    function employ(cur: number, max: number) {
      logger.debug(`current employ ${cur}, ${max}, ${scale}`);
      return cur < max * scale;
    }
  }

  private assignRole(role: Role) {
    const creep = this.unemployed.shift();
    if (creep) {
      logger.debug(`employing ${creep.name} in role ${role}`);
      creep.memory.role = role;
    }
  }

  private getWorkerCounts = () => {
    for (const creep of this.myCreeps) {
      if (creep.room.name === this.room.name) {
        logger.debug(`worker counting:`);
        logger.printObject(creep);
        switch (creep.memory.role) {
          case Role.ROLE_HARVESTER:
            this.numHarversters = this.numHarversters + 1;
            break;
          case Role.ROLE_UPGRADER:
            this.numUpgraders = this.numUpgraders + 1;
            break;
          case Role.ROLE_HAULER:
            this.numHaulers = this.numHaulers + 1;
            break;
          case Role.ROLE_BUILDER:
            this.numBuilders = this.numBuilders + 1;
            break;
          case Role.ROLE_CONTINUOUS_HARVESTER:
            this.numContinuousHarvesters = this.numContinuousHarvesters + 1;
            break;
          default:
            this.unemployed.push(creep);
            logger.info("Unemployed creep: %s", logger.json(creep));
        }
      }
      logger.info(
        `Workers:, harv:${this.numHarversters} build: ${this.numBuilders} upgrade: ${this.numUpgraders} haul:${this.numHaulers} unemployed:${this.unemployed.length}`
      );
    }
  };

  private runCreepActions() {
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
