console.log('hello screeps');

import { Slowdeath } from './SlowDeath';
import { Stats } from './stats/stats';


export function loop():void {
    console.log("Begin of Tick:", Game.time , " Cpu: ", Game.cpu.getUsed());
  if(Memory.count === undefined){
      Memory.count =0;
  }
  Slowdeath.init();
  Slowdeath.run();
  console.log("Pre Stats Tick: %d Cpu: %d",Game.time, Game.cpu.getUsed());
  Stats.run();
  console.log("Post Stats Tick",Game.time, "Cpu: ", Game.cpu.getUsed());
  if (Game.cpu.bucket === 10000) {
    Game.cpu.generatePixel();
  }
  console.log("End of Tick:", Game.time , " Cpu: ", Game.cpu.getUsed());
}