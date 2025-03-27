import {
  MaxPopulationPerRoom,
  MaxRolePopulation,
  PopulationScaler,
  Role
} from "../creepActions/constants";
import { Builder } from "../creepActions/Builder";
import { Claimer } from "slowdeath/creepActions/claimer";
import { ContinuousHarvester } from "../creepActions/ContinuousHarvester";
import { Harvester } from "../creepActions/Harvester";
import { Hauler } from "../creepActions/Hauler";
import { Process } from "../../os/process";
import { Upgrader } from "../creepActions/Upgrader";
import { logger } from "../../utils/logger";
import { Dismantler } from "slowdeath/creepActions/Dismantler";
import { RemoteMiner } from "../creepActions/RemoteMiner";

export class Employment extends Process {
  protected className = "employment";
  private myCreeps: Creep[] = [];
  private numHarversters = 0;
  private numBuilders = 0;
  private numHaulers = 0;
  private numUpgraders = 0;
  private numContinuousHarvesters = 0;
  private numRemoteMiners = 0;
  private unemployed: Creep[] = [];
  private room!: Room;
  private metadata?: CityData;
  private numClaimer = 0;
  private rcl = 0;

  public main() {
    this.initilize();
    this.getWorkerCounts();
    this.populationBasedEmployer();
    this.runCreepActions();
  }

  private initilize() {
    this.metadata = this.data as CityData;
    this.room = Game.rooms[this.metadata.roomName];
    if (this.room.controller) {
      this.rcl = this.room.controller.level;
    }
    logger.info(`${this.className}: Starting employment in ${this.metadata.roomName}`);
    this.myCreeps = _.values(Game.creeps);
    logger.info(
      `${this.room.name} energy Available: ${this.room.energyAvailable} capacity: ${this.room.energyCapacityAvailable}`
    );
  }

  private populationBasedEmployer() {
    const totWorkers = this.getTotalWorkers();
    this.checkEmemrgencySituation(totWorkers);
    const scale = Math.max(
      Math.floor(MaxPopulationPerRoom[this.rcl] / PopulationScaler[this.rcl]),
      1
    );

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

  private createWorkers(employ: (cur: number, max: number) => boolean) {
    // FIXME: Improve this logic
    const spawnQueue = this.room.memory.spawnQueue;
    spawnQueue.forEach(role => {
      this.workerCounter(role);
    });
    const buildersRequired = !(
      this.rcl >= 4 &&
      this.numBuilders >= 1 &&
      !this.room.memory.extraBuilders
    );
    if (
      employ(this.numHarversters, MaxRolePopulation.harvesters) &&
      !this.room.memory.continuousHarvestingStarted
    ) {
      spawnQueue.push(Role.HARVESTER);
    } else if (
      employ(this.numHaulers, MaxRolePopulation.haulers) &&
      this.room.memory.continuousHarvestingStarted
    ) {
      spawnQueue.push(Role.HAULER);
    } else if (employ(this.numBuilders, this.dynamicEmployer(Role.BUILDER)) && buildersRequired) {
      spawnQueue.push(Role.BUILDER);
    } else if (employ(this.numUpgraders, this.dynamicEmployer(Role.UPGRADER))) {
      spawnQueue.push(Role.UPGRADER);
    }
  }

  private checkEmemrgencySituation(totWorkers: number) {
    this.room.memory.critical = totWorkers < PopulationScaler[this.rcl];
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
    this.room.memory.continuousHarvestingStarted = this.numContinuousHarvesters >= 1;
  }

  private dynamicEmployer(role: Role): number {
    if (role === Role.BUILDER) {
      if (this.room.memory.extraBuilders) {
        return MaxRolePopulation.builders + 1;
      } else {
        return MaxRolePopulation.builders;
      }
    } else if (role === Role.UPGRADER) {
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

        const unemployed = this.workerCounter(creep.memory.role);
        if (unemployed) {
          this.unemployed.push(creep);
          logger.warning("Unemployed creep: %s", logger.json(creep));
        }
      }
    }
    logger.info(
      `Workers:, harv:${this.numHarversters} build: ${this.numBuilders} upgrade: ${this.numUpgraders} haul:${this.numHaulers}  claimer: ${this.numClaimer} cont_harv: ${this.numContinuousHarvesters} unemployed:${this.unemployed.length}`
    );
    new RoomVisual(this.room.name).text(
      `Workers:, harv:${this.numHarversters} build: ${this.numBuilders} upgrade: ${this.numUpgraders} haul:${this.numHaulers}  claimer: ${this.numClaimer} cont_harv: ${this.numContinuousHarvesters} unemployed:${this.unemployed.length}`,
      25,
      4
    );
  };

  private workerCounter(role: Role) {
    const roleCounters: Record<Role, () => void> = {
      [Role.HARVESTER]: () => this.numHarversters++,
      [Role.UPGRADER]: () => this.numUpgraders++,
      [Role.HAULER]: () => this.numHaulers++,
      [Role.BUILDER]: () => this.numBuilders++,
      [Role.CONTINUOUS_HARVESTER]: () => this.numContinuousHarvesters++,
      [Role.CLAIMER]: () => this.numClaimer++,
      [Role.DISMANTLER]: () => {},
      [Role.REM_UPGRADER]: () => {},
      [Role.REMOTE_MINER]: () => this.numRemoteMiners++
    };

    if (role in roleCounters) {
      roleCounters[role]();
      return false;
    }

    return true;
  }

  private runCreepActions() {
    const creepActions: Record<Role, (creep: Creep) => void> = {
      [Role.HARVESTER]: Harvester.run,
      [Role.HAULER]: Hauler.run,
      [Role.BUILDER]: Builder.run,
      [Role.UPGRADER]: Upgrader.run,
      [Role.CONTINUOUS_HARVESTER]: ContinuousHarvester.run,
      [Role.CLAIMER]: Claimer.run,
      [Role.DISMANTLER]: Dismantler.run,
      [Role.REM_UPGRADER]: () => {},
      [Role.REMOTE_MINER]: RemoteMiner.run
    };

    for (const creep of this.myCreeps) {
      if (creep.pos.roomName !== this.room.name && creep.memory.role !== Role.REMOTE_MINER) {
        continue;
      }

      if (creep.memory.role in creepActions) {
        creepActions[creep.memory.role as Role](creep);
      }
    }
  }
}
