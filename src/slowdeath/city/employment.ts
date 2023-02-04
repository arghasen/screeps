import { MaxPopulationPerRoom, MaxRolePopulation, PopulationScaler, Role } from "../creepActions/constants";
import { Builder } from "../creepActions/Builder";
import { Claimer } from "slowdeath/creepActions/claimer";
import { ContinuousHarvester } from "../creepActions/ContinuousHarvester";
import { Harvester } from "../creepActions/Harvester";
import { Hauler } from "../creepActions/Hauler";
import { Process } from "../../os/process";
import { Upgrader } from "../creepActions/Upgrader";
import { logger } from "../../utils/logger";
import { Dismantler } from "slowdeath/creepActions/Dismantler";

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
  private numClaimer = 0;
  private rcl = 0;

  public main() {
    this.metadata = this.data as CityData;
    this.room = Game.rooms[this.metadata.roomName];
    if (this.room.controller) {
      this.rcl = this.room.controller.level;
    }
    logger.info(`${this.className}: Starting employment in ${this.metadata.roomName}`);
    this.myCreeps = _.values(Game.creeps);

    this.getWorkerCounts();
    this.populationBasedEmployer();
    this.runCreepActions();
  }

  private populationBasedEmployer() {
    const totWorkers = this.getTotalWorkers();
    this.checkEmemrgencySituation(totWorkers);
    const scale = Math.max(Math.floor(MaxPopulationPerRoom[this.rcl] / PopulationScaler[this.rcl]), 1);

    this.waitForContiniousHarvester(totWorkers);
    this.storeHarvestingStatus();
    if (totWorkers + this.room.memory.spawnQueue.length < MaxPopulationPerRoom[this.rcl]) {
      this.createWorkers(employ);
    }

    function employ(cur: number, max: number) {
      logger.debug(`current employ ${cur}, ${max}, ${scale}`);
      return cur < max * scale;
    }
  }
  createWorkers(employ: (cur: number, max: number) => boolean) {

    // FIXME: Improve this logic
    const spawnQueue = this.room.memory.spawnQueue;

    spawnQueue.forEach((role)=>{this.workerCounter(role);})

    const buildersRequired = (this.rcl >= 7 && this.numBuilders >= 1) ? false : true;
    if (
      employ(this.numHarversters, MaxRolePopulation.harvesters) &&
      !this.room.memory.continuousHarvestingStarted
    ) {
      spawnQueue.push(Role.ROLE_HARVESTER);
    } else if (
      employ(this.numHaulers, MaxRolePopulation.haulers) &&
      this.room.memory.continuousHarvestingStarted
    ) {
      spawnQueue.push(Role.ROLE_HAULER);
    } else if (employ(this.numBuilders, this.dynamicEmployer(Role.ROLE_BUILDER)) && buildersRequired) {
      spawnQueue.push(Role.ROLE_BUILDER);
    } else if (employ(this.numUpgraders, this.dynamicEmployer(Role.ROLE_UPGRADER))) {
      spawnQueue.push(Role.ROLE_UPGRADER);
    }
  }

  private checkEmemrgencySituation(totWorkers: number) {
    if (totWorkers < PopulationScaler[this.rcl] && this.rcl <= 1) {
      this.room.memory.critical = true;
    }
    else if (totWorkers < PopulationScaler[this.rcl] * 2 && this.rcl >= 2) {
      this.room.memory.critical = true;
    }
    else {
      this.room.memory.critical = false;
    }
  }

  private waitForContiniousHarvester(totWorkers: number) {
    if (this.numContinuousHarvesters >= MaxRolePopulation.continuousHarvester) {
      this.room.memory.createContinuousHarvester = false;
      return false;
    }
    if (this.room.energyCapacityAvailable >= 550 && totWorkers > PopulationScaler[this.rcl]) {
      console.log("delaying new creeps till continious harvestors");
      this.room.memory.createContinuousHarvester = true;
      return true;
    }
    return false;
  }

  private getTotalWorkers() {
    return (
      this.numBuilders +
      this.numHarversters +
      this.numUpgraders +
      this.numHaulers +
      this.unemployed.length
    );
  }

  private storeHarvestingStatus() {
    if (this.numContinuousHarvesters >= 1) {
      this.room.memory.continuousHarvestingStarted = true;
    } else {
      this.room.memory.continuousHarvestingStarted = false;
    }
  }

  private employWorkers(employ: (cur: number, max: number) => boolean) {

    if (Memory.needBuilder && Memory.needBuilder.sent === "") {
      const creep = this.unemployed.shift();
      if (creep) {
        logger.debug(`employing ${creep.name} in role ${Role.ROLE_BUILDER}`);
        creep.memory.role = Role.ROLE_BUILDER;
        creep.memory.moveLoc = Memory.needBuilder.moveLoc;
        Memory.needBuilder.sent = creep.name;
      }
    }
  }

  private dynamicEmployer(role: Role): number {
    if (role == Role.ROLE_BUILDER) {
      if (this.room.memory.extraBuilders) {
        return MaxRolePopulation.builders + 1;
      } else {
        return MaxRolePopulation.builders;
      }
    } else if (role == Role.ROLE_UPGRADER) {
      if (this.room.memory.extraBuilders) {
        return MaxRolePopulation.upgrader - 1;
      } else {
        return MaxRolePopulation.upgrader;
      }
    }
    return 0;
  }

  private getWorkerCounts = () => {
    for (const creep of this.myCreeps) {
      if (creep.room.name === this.room.name) {
        logger.debug(`worker counting: ${logger.json(creep)};`);

        const unemployed = this.workerCounter(creep.memory.role || -1);
        if (unemployed) {
          this.unemployed.push(creep);
          logger.info("Unemployed creep: %s", logger.json(creep));
        }

      }
    }
    logger.info(
      `Workers:, harv:${this.numHarversters} build: ${this.numBuilders} upgrade: ${this.numUpgraders} haul:${this.numHaulers}  claimer: ${this.numClaimer} cont_harv: ${this.numContinuousHarvesters} unemployed:${this.unemployed.length}`
    );
    new RoomVisual(this.room.name).text(`Workers:, harv:${this.numHarversters} build: ${this.numBuilders} upgrade: ${this.numUpgraders} haul:${this.numHaulers}  claimer: ${this.numClaimer} cont_harv: ${this.numContinuousHarvesters} unemployed:${this.unemployed.length}`, 25, 4);
  };

  private workerCounter(role: Role) {
    let unemployed = false;
    switch (role) {
      case Role.ROLE_HARVESTER:
        this.numHarversters++;
        break;
      case Role.ROLE_UPGRADER:
        this.numUpgraders++;
        break;
      case Role.ROLE_HAULER:
        this.numHaulers++;
        break;
      case Role.ROLE_BUILDER:
        this.numBuilders++;
        break;
      case Role.ROLE_CONTINUOUS_HARVESTER:
        this.numContinuousHarvesters++;
        break;
      case Role.ROLE_CLAIMER:
        this.numClaimer++;
        break;
      case Role.ROLE_DISMANTLER:
        break;
      default:
        unemployed = true;
        break;
    }
    return unemployed;
  }

  private runCreepActions() {
    for (const creep of this.myCreeps) {
      if (creep.pos.roomName !== this.room.name) {
        continue;
      }
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
        case Role.ROLE_CLAIMER:
          Claimer.run(creep);
          break;
        case Role.ROLE_DISMANTLER:
        //  Dismantler.run(creep);
        default:
          _.noop();
      }
    }
  }
}
