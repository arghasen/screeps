import { Manager } from './Manager'
import _ from "lodash";
import { Harvester } from 'Harvester';

export class RoomManager extends Manager {
    spawns: StructureSpawn[] = []
    myCreeps:Creep[]=[]
    init = (room: Room) => {
        var gameSpawns = Game.spawns;
        for (var spawnName in gameSpawns) {
            if (gameSpawns[spawnName].room.name == room.name) {
                this.spawns.push(gameSpawns[spawnName])
            }
        }
        
         this.myCreeps =_.values(Game.creeps);
         console.log(this.myCreeps)
        if(this.myCreeps.length ==0)
            {
                var energyAvailable =room.energyAvailable
                this.createCreep(energyAvailable)
            }
    }
 createCreep =(energyAvailable: any) => {

    this.spawns[0].spawnCreep([WORK,CARRY,MOVE],"creep"+Game.time)
}

run=()=>{
    for(var creep of this.myCreeps)
        {
            Harvester.run(creep);
        }
}
}

