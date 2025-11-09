import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import { findStructureNeedingRepair } from "../creepActions/CommonActions";
import { objectFromId } from "../../utils/screeps-fns";
import { Role } from "slowdeath/creepActions/constants";

interface ThreatAssessment {
  creep: Creep;
  threatLevel: number;
  priority: number;
  distance: number;
  healthRatio: number;
}

interface TowerStrategy {
  tower: StructureTower;
  energy: number;
  energyRatio: number;
  canAttack: boolean;
  canHeal: boolean;
  canRepair: boolean;
}

export class Military extends Process {
  protected className = "military";
  private metadata?: CityData;
  private towers: StructureTower[] = [];

  public main() {
    this.metadata = this.data as CityData;
    logger.debug(`${this.className}: Starting military for ${this.metadata.roomName}`);
    const room = Game.rooms[this.metadata.roomName];
    this.towers = this.findTowers(room);

    if (!this.defendRoom(room)) {
      this.repairRoom(room);
    }
  }

  private findTowers(room: Room): StructureTower[] {
    return room.find(FIND_MY_STRUCTURES, {
      filter: (structure: Structure) =>
        structure.structureType === STRUCTURE_TOWER && structure.isActive()
    });
  }

  private repairRoom(room: Room): void {
    if (this.towers.length === 0) {
      logger.debug(`${this.className}: No towers found in room ${room.name}`);
      return;
    }

    // Handle healing first if needed
    if (this.handleHealing(room)) {
      return;
    }

    // Find the best tower for repair based on energy and efficiency
    const repairTower = this.selectBestTower();
    if (!repairTower) return;

    const targetStructure = findStructureNeedingRepair(room, repairTower.pos, "tower");
    if (targetStructure) {
      repairTower.repair(targetStructure);
      logger.debug(
        `${this.className}: Repairing structure ${targetStructure.id} at ${logger.json(
          targetStructure.pos
        )}`
      );
    }
  }

  private handleHealing(room: Room): boolean {
    if (room.memory.heal.length === 0) return false;

    const healTarget = objectFromId<Creep>(room.memory.heal[0]);
    if (!healTarget || healTarget.hits >= healTarget.hitsMax) {
      room.memory.heal.shift();
      return false;
    }

    // Find the best tower for healing
    const healTower = this.selectBestTower();
    if (!healTower) return false;

    healTower.heal(healTarget);
    logger.debug(`${this.className}: Healing creep ${healTarget.name} with tower ${healTower.id}`);
    return true;
  }

  private selectBestTower(): StructureTower | null {
    if (this.towers.length === 0) return null;

    return this.towers.reduce((best, tower) => {
      const bestEnergy = best.store[RESOURCE_ENERGY];
      const towerEnergy = tower.store[RESOURCE_ENERGY];

      // Prefer towers with higher energy for repair
      return towerEnergy > bestEnergy ? tower : best;
    });
  }

  private defendRoom(room: Room): boolean {
    const hostiles: Creep[] = room.find(FIND_HOSTILE_CREEPS);
    const hasHostiles = hostiles.length > 0;

    if (hasHostiles) {
      room.memory.enemy = { s: true, lS: Game.time };
      Game.notify(`Enemy spotted in room ${room.name} - ${hostiles.length} hostiles detected`);
      this.attackHostiles(hostiles);
    } else {
      room.memory.enemy = undefined;
    }

    return hasHostiles;
  }

  private attackHostiles(hostiles: Creep[]): void {
    if (this.towers.length === 0) {
      logger.error(`${this.className}: No towers available for defense`);
      return;
    }

    // Assess all threats and prioritize them
    const threatAssessment = this.assessThreats(hostiles);
    if (threatAssessment.length === 0) return;

    // Sort threats by priority (highest first)
    threatAssessment.sort((a, b) => b.priority - a.priority);

    // Get tower strategies for optimal resource allocation
    const towerStrategies = this.getTowerStrategies();

    // Execute coordinated tower attacks
    this.executeCoordinatedTowerAttacks(threatAssessment, towerStrategies);
  }

  private assessThreats(hostiles: Creep[]): ThreatAssessment[] {
    return hostiles.map(hostile => {
      const distance = this.getClosestTowerDistance(hostile);
      const healthRatio = hostile.hits / hostile.hitsMax;

      // Calculate threat level based on body parts
      const attackParts = hostile.getActiveBodyparts(ATTACK);
      const rangedAttackParts = hostile.getActiveBodyparts(RANGED_ATTACK);
      const workParts = hostile.getActiveBodyparts(WORK);
      const carryParts = hostile.getActiveBodyparts(CARRY);
      const healParts = hostile.getActiveBodyparts(HEAL);
      const toughParts = hostile.getActiveBodyparts(TOUGH);

      let threatLevel = 0;
      threatLevel += attackParts * 10; // Melee attackers are dangerous
      threatLevel += rangedAttackParts * 12; // Ranged attackers are very dangerous
      threatLevel += workParts * 3; // Workers can dismantle
      threatLevel += carryParts * 1; // Carriers are low threat
      threatLevel += healParts * 8; // Healers can sustain other threats
      threatLevel += toughParts * 2; // Tough parts increase survivability

      // Calculate priority score
      let priority = threatLevel;
      priority += Math.max(0, 20 - distance) * 2; // Closer threats get higher priority
      priority += (1 - healthRatio) * 10; // Lower health = easier to kill

      return {
        creep: hostile,
        threatLevel,
        priority,
        distance,
        healthRatio
      };
    });
  }

  private getClosestTowerDistance(hostile: Creep): number {
    if (this.towers.length === 0) return 50;

    return Math.min(...this.towers.map(tower => tower.pos.getRangeTo(hostile)));
  }

  private getTowerStrategies(): TowerStrategy[] {
    return this.towers.map(tower => {
      const energy = tower.store[RESOURCE_ENERGY];
      const energyRatio = energy / tower.store.getCapacity(RESOURCE_ENERGY);

      return {
        tower,
        energy,
        energyRatio,
        canAttack: energy >= TOWER_ENERGY_COST,
        canHeal: energy >= TOWER_ENERGY_COST,
        canRepair: energy >= TOWER_ENERGY_COST
      };
    });
  }

  private executeCoordinatedTowerAttacks(
    threats: ThreatAssessment[],
    towerStrategies: TowerStrategy[]
  ): void {
    // Filter towers that can attack
    const availableTowers = towerStrategies.filter(strategy => strategy.canAttack);
    if (availableTowers.length === 0) {
      logger.warning(`${this.className}: No towers have sufficient energy to attack`);
      return;
    }

    // Distribute targets among available towers
    let targetIndex = 0;

    for (const towerStrategy of availableTowers) {
      if (targetIndex >= threats.length) break;

      const target = threats[targetIndex];
      const attackResult = towerStrategy.tower.attack(target.creep);

      if (attackResult === OK) {
        logger.info(
          `${this.className}: Tower ${towerStrategy.tower.id} attacking ${target.creep.name} ` +
            `(threat: ${target.threatLevel}, priority: ${target.priority})`
        );

        // Move to next target for next tower
        targetIndex++;
      } else {
        logger.warning(
          `${this.className}: Tower ${towerStrategy.tower.id} failed to attack: ${attackResult}`
        );
      }
    }

    // Log remaining threats
    if (targetIndex < threats.length) {
      const remainingThreats = threats.slice(targetIndex);
      logger.warning(
        `${this.className}: ${remainingThreats.length} threats remain unengaged due to insufficient tower energy`
      );
    }
  }

  /**
   * Emergency response: Spawn defenders if under heavy attack
   */
  private emergencyResponse(room: Room, threatCount: number): void {
    if (threatCount >= 3) {
      // Multiple threats detected - consider emergency measures
      const myCreeps = room.find(FIND_MY_CREEPS);
      const defenders = myCreeps.filter(creep => creep.memory.role === Role.DEFENDER);

      if (defenders.length < Math.min(threatCount, 5)) {
        // Need more defenders
        logger.warning(
          `${this.className}: Emergency - ${threatCount} threats detected, ` +
            `only ${defenders.length} defenders available`
        );

        // Could trigger emergency spawn here if spawn system is accessible
        // For now, just log the situation
      }
    }
  }
}
