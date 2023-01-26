import { Role } from "slowdeath/creepActions/constants";
import { Dismantler } from "slowdeath/creepActions/Dismantler";
import { Process } from "../../os/process";
import { logger } from "../../utils/logger";
import { findStructureNeedingRepair } from "../creepActions/CommonActions"

export class Military extends Process {
  protected className = "military";
  private metadata?: CityData;
  private towers: StructureTower[] = [];
  private defendedRoomThisTick: boolean = false;
  public main() {
    this.metadata = this.data as CityData;
    logger.info(`${this.className}: Starting military for ${this.metadata.roomName}`);
    const room = Game.rooms[this.metadata.roomName];
    this.towers = room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    });
    if (room.controller?.my && room.controller.level >= 3) {
      if (this.towers.length < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][room.controller.level]) {
        logger.info("time to build a tower");
        room.createConstructionSite(25, 25, STRUCTURE_TOWER);
      }
    }
    this.defendRoom(room);
    if (!this.defendedRoomThisTick) {
      this.repairRoom(room);
    }
    const creep_ = _.filter(Game.creeps, (creep)=>{return creep.memory.role === Role.ROLE_DISMANTLER});
    if(creep_.length<1){
      Game.spawns.Spawn3.spawnCreep([WORK,WORK,WORK, WORK, WORK, WORK, MOVE,MOVE], "das1",{memory:{role:7, harvesting:false}})
    }
    for(let c of creep_){
      Dismantler.run(c);
    }
  }

  private repairRoom(room: Room): void {
    const repairTower = this.towers[0];
    if (repairTower) {
      const targetStructure = findStructureNeedingRepair(room, repairTower.pos);
      if (targetStructure) {
        repairTower.repair(targetStructure);
      }
    }
  }

  private defendRoom(room: Room): void {
    const hostiles: Creep[] = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      Game.notify(`enemy spotted in room ${room.name}`);

      this.towers.forEach((tower: AnyOwnedStructure): void => {
        if (tower.structureType === STRUCTURE_TOWER) {
          tower.attack(hostiles[0]);
        }
      });
      this.defendedRoomThisTick = true;
    }
  }
}
