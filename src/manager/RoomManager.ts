import { Manager } from './Manager'
import { Harvester } from 'workers/Harvester';
import{controllerConsts, maxRolePopulation, Role} from '../constants'

export class RoomManager extends Manager {
    spawns: StructureSpawn[] = []
    myCreeps: Creep[] = []
    sources: Source[] = []
    init = (room: Room) => {
        var gameSpawns = Game.spawns;
        for (var spawnName in gameSpawns) {
            if (gameSpawns[spawnName].room.name == room.name) {
                this.spawns.push(gameSpawns[spawnName])
            }
        }
        this.sources = room.find(FIND_SOURCES);
        this.myCreeps = _.values(Game.creeps);
        console.log(JSON.stringify(Game.creeps))
        console.log(this.myCreeps)
        if (this.myCreeps.length < this.sources.length) {
            var energyAvailable = room.energyAvailable
            this.createCreep(energyAvailable, Role.ROLE_HARVESTER)
        }

        // if(this.myCreeps.length < maxRolePopulation.total)
        // {
        //     var energyAvailable = room.energyAvailable
        //     this.createCreep(energyAvailable, Role.)
        // }
        if (room.controller?.level == 2) {
            for(var i = 0; i < controllerConsts.lvl2extensions; i++) 
              {
                var res=room.createConstructionSite(this.spawns[0].pos.x+i, this.spawns[0].pos.y+i, STRUCTURE_EXTENSION);
                console.log("result for creation", res);
              }  
        }
    }
    createCreep = (energyAvailable: any, role:Role) => {

        this.spawns[0].spawnCreep([WORK, CARRY, MOVE], "creep" + Game.time,{memory:{role:role}})
    }

    run = () => {
        for (var creep of this.myCreeps) {
            switch(creep.memory.role )
            {
                case Role.ROLE_HARVESTER:
                    Harvester.run(creep);
                case Role.ROLE_HAULER:
                    Hauler.run(creep);
                case Role.ROLE_BUILDER:
                    Builder.run(creep);
                case Role.ROLE_UPGRADER:
                    Upgrader.run(creep);
            }
            
        }
    }
}

