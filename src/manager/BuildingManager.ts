import { Manager } from './Manager';
import { controllerConsts, directionsArray, extensionLoc } from '../constants';

export class BuildingManager extends Manager {
  spawns: StructureSpawn[] = [];

  extensionsUnderConstruction: ConstructionSite[] = [];
  extensionsCreated: AnyOwnedStructure[] = [];

  init = (room: Room) => {
    var gameSpawns = Game.spawns;
    for (var spawnName in gameSpawns) {
      if (gameSpawns[spawnName].room.name == room.name) {
        this.spawns.push(gameSpawns[spawnName]);
      }
    }

    var myStructures = room.find(FIND_MY_STRUCTURES);
    this.extensionsCreated = myStructures.filter(
      (structure) => structure.structureType === STRUCTURE_EXTENSION
    );

    var constructionSites = room.find(FIND_CONSTRUCTION_SITES);
    this.extensionsUnderConstruction = constructionSites.filter(
      (site) => site.structureType === STRUCTURE_EXTENSION
    );

    if (room.controller?.level === 2) {
      if(this.extensionsCreated.length!= controllerConsts.lvl2extensions)
          {
              Memory.focus = "build"
          }
     else
         {
             Memory.focus = "upgrade"
         }
         if(this.spawns.length<1)
         {
             return;
         }
      if (this.getTotalExtensions() < controllerConsts.lvl2extensions ) {
        this.createExtensions(room);

      } else if(!Memory.roadsDone){
        var sources = this.spawns[0].room.find(FIND_SOURCES);
        for (var j = 0; j < sources.length; j++)
        {
            var chemin = this.spawns[0].pos.findPathTo(sources[j].pos);
            for (var i = 0; i < chemin.length; i++) 
            {
                this.spawns[0].room.createConstructionSite(chemin[i].x,chemin[i].y, STRUCTURE_ROAD);
            }
        }
        Memory.roadsDone = true;
        //this.setupMineContainers(room);
      }
    }
  };

  run = () => {};

    private setupMineContainers(room: Room) {
        var sources = room.find(FIND_SOURCES);
        for (const source of sources) {
            var possibleMiningLocations = [];
            for (const loc of directionsArray) {
                var x = source.pos.x + loc[0];
                var y = source.pos.y + loc[1];
                const terrain = room.getTerrain().get(x, y);
                console.log("Terrain at: (" + x + "," + y + "):" + terrain);
                if (terrain != TERRAIN_MASK_WALL) {
                    possibleMiningLocations.push(loc);
                }
                console.log("Possible Mining Locations:", possibleMiningLocations);
                // const closestSource = PathFinder.search(this.spawns[0].pos, possibleMiningLocations);
                // console.log("closest path to source")
            }
        }
    }

  private getTotalExtensions():number {
    return (
      this.extensionsUnderConstruction.length + this.extensionsCreated.length
    );
  }

  private createExtensions(room: Room) {
    var loc = _.cloneDeep(extensionLoc[2]);
    for (
      var i:number = this.getTotalExtensions();
      i < controllerConsts.lvl2extensions;
      i++
    ) {
      console.log(loc);
      var res = room.createConstructionSite(
        this.spawns[0].pos.x + loc[i][0],
        this.spawns[0].pos.y + loc[i][1],
        STRUCTURE_EXTENSION
      );
      console.log('result for creation', res);
      if (res !== 0) {
        loc.splice(i, 1);
        --i;
      }
    }
  }
}