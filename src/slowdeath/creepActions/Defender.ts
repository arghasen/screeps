import { logger } from "utils/logger";
import { Actor } from "./Actor";

export class Defender extends Actor {
  private static readonly RAMPART_SEARCH_RANGE = 10;

  public static run = (creep: Creep): void => {
    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      this.engageHostiles(creep, hostiles);
    }
  };

  /**
   * Engage hostile creeps
   */
  private static engageHostiles(creep: Creep, hostiles: Creep[]): void {
    creep.say("🛡️ Defend!");

    // Prioritize targets based on threat level
    const prioritizedTarget = this.selectPriorityTarget(creep, hostiles);
    if (!prioritizedTarget) return;

    // Try to find a good defensive position (rampart) if available
    const defensivePosition = this.findDefensivePosition(creep, prioritizedTarget);

    if (defensivePosition && !creep.pos.isEqualTo(defensivePosition.pos)) {
      // Move to defensive position
      creep.moveTo(defensivePosition, {
        visualizePathStyle: { stroke: "#ff0000" },
        reusePath: 2
      });
      return;
    }

    // Use ranged attack if available and beneficial
    const hasRangedAttack = creep.getActiveBodyparts(RANGED_ATTACK) > 0;
    const rangeToTarget = creep.pos.getRangeTo(prioritizedTarget);

    if (hasRangedAttack && rangeToTarget <= 3) {
      // Use ranged attack for better positioning
      const rangedResult = creep.rangedAttack(prioritizedTarget);
      if (rangedResult === OK) {
        logger.info(
          `Defender ${creep.name} ranged attacking hostile ${prioritizedTarget.name} at (${prioritizedTarget.pos.x},${prioritizedTarget.pos.y})`
        );

        // Also try to hit multiple targets with ranged mass attack if enemies are clustered
        const nearbyEnemies = creep.pos.findInRange(hostiles, 3);
        if (nearbyEnemies.length > 1) {
          creep.rangedMassAttack();
        }
      }

      // Maintain optimal distance for ranged attacks
      if (rangeToTarget === 1) {
        // Too close, try to back away while staying on ramparts if possible
        this.maintainRangedDistance(creep, prioritizedTarget, defensivePosition);
        return;
      }
    }

    // Use melee attack
    const attackResult = creep.attack(prioritizedTarget);

    if (attackResult === ERR_NOT_IN_RANGE) {
      // Move closer to attack
      creep.moveTo(prioritizedTarget, {
        visualizePathStyle: { stroke: "#ff0000" },
        reusePath: 2
      });
    } else if (attackResult === OK) {
      logger.info(
        `Defender ${creep.name} melee attacking hostile ${prioritizedTarget.name} at (${prioritizedTarget.pos.x},${prioritizedTarget.pos.y})`
      );
    }
  }

  /**
   * Select priority target based on threat level
   */
  private static selectPriorityTarget(creep: Creep, hostiles: Creep[]): Creep | null {
    if (hostiles.length === 0) return null;
    if (hostiles.length === 1) return hostiles[0];

    // Priority scoring system
    const scoredTargets = hostiles.map(hostile => {
      let score = 0;

      // Distance factor (closer = higher priority)
      const distance = creep.pos.getRangeTo(hostile);
      score += Math.max(0, 10 - distance);

      // Health factor (lower health = higher priority for quick kills)
      const healthRatio = hostile.hits / hostile.hitsMax;
      score += (1 - healthRatio) * 15;

      // Body parts threat assessment
      const attackParts = hostile.getActiveBodyparts(ATTACK);
      const rangedAttackParts = hostile.getActiveBodyparts(RANGED_ATTACK);
      const workParts = hostile.getActiveBodyparts(WORK);
      const carryParts = hostile.getActiveBodyparts(CARRY);

      // Combat creeps are high priority
      score += attackParts * 8;
      score += rangedAttackParts * 10;

      // Economic threats (builders/miners) are medium priority
      score += workParts * 3;
      score += carryParts * 2;

      // Prioritize targets near important structures
      const nearImportantStructure = this.isNearImportantStructure(hostile, creep.room);
      if (nearImportantStructure) {
        score += 20;
      }

      return { hostile, score };
    });

    // Sort by score (highest first) and return best target
    scoredTargets.sort((a, b) => b.score - a.score);
    return scoredTargets[0].hostile;
  }

  /**
   * Check if hostile is near important structures
   */
  private static isNearImportantStructure(hostile: Creep, room: Room): boolean {
    const importantStructures = room.find(FIND_MY_STRUCTURES, {
      filter: structure =>
        structure.structureType === STRUCTURE_SPAWN ||
        structure.structureType === STRUCTURE_TOWER ||
        structure.structureType === STRUCTURE_STORAGE ||
        structure.structureType === STRUCTURE_TERMINAL
    });

    return importantStructures.some(structure => hostile.pos.getRangeTo(structure) <= 3);
  }

  /**
   * Maintain optimal distance for ranged attacks
   */
  private static maintainRangedDistance(
    creep: Creep,
    target: Creep,
    preferredPosition: StructureRampart | null
  ): void {
    // Try to move to range 2-3 for optimal ranged attack
    const directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];

    for (const moveDirection of directions) {
      const newX =
        creep.pos.x +
        (moveDirection === RIGHT || moveDirection === TOP_RIGHT || moveDirection === BOTTOM_RIGHT
          ? 1
          : moveDirection === LEFT || moveDirection === TOP_LEFT || moveDirection === BOTTOM_LEFT
          ? -1
          : 0);
      const newY =
        creep.pos.y +
        (moveDirection === BOTTOM || moveDirection === BOTTOM_LEFT || moveDirection === BOTTOM_RIGHT
          ? 1
          : moveDirection === TOP || moveDirection === TOP_LEFT || moveDirection === TOP_RIGHT
          ? -1
          : 0);

      // Check bounds
      if (newX < 0 || newX > 49 || newY < 0 || newY > 49) continue;

      const targetPos = new RoomPosition(newX, newY, creep.room.name);
      const rangeToTarget = targetPos.getRangeTo(target);

      if (rangeToTarget >= 2 && rangeToTarget <= 3) {
        // Check if there's a rampart at this position
        const structures = targetPos.lookFor(LOOK_STRUCTURES);
        const hasRampart = structures.some(s => s.structureType === STRUCTURE_RAMPART);

        if (hasRampart || !preferredPosition) {
          creep.move(moveDirection);
          return;
        }
      }
    }

    // Fallback: just move away from target
    const retreatDirection = target.pos.getDirectionTo(creep.pos);
    if (retreatDirection) {
      creep.move(retreatDirection);
    }
  }

  /**
   * Find a defensive position like ramparts near the target
   */
  private static findDefensivePosition(creep: Creep, target: Creep): StructureRampart | null {
    const ramparts = creep.room.find(FIND_MY_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_RAMPART
    });

    if (ramparts.length === 0) return null;

    // Find ramparts that are close to the target but still provide good positioning
    const suitableRamparts = ramparts.filter(rampart => {
      const distanceToTarget = rampart.pos.getRangeTo(target);
      const distanceToCreep = rampart.pos.getRangeTo(creep);

      // Rampart should be within attack range of target and reasonably close to defender
      return distanceToTarget <= 3 && distanceToCreep <= this.RAMPART_SEARCH_RANGE;
    });

    if (suitableRamparts.length === 0) return null;

    // Choose the rampart closest to the target for maximum effectiveness
    return target.pos.findClosestByRange(suitableRamparts);
  }
}
