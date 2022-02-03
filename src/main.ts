console.log('hello screeps');

import { Slowdeath } from './SlowDeath';
import { Stats } from './stats/stats';


export function loop() {
  if(!Memory.count){
      Memory.count =0;
  }
  Slowdeath.init();
  Slowdeath.run();
  console.log("Pre Stats Tick:" + Game.time + " Cpu: "+ Game.cpu.getUsed());
  Stats.run();
  console.log("Post Stats Tick",Game.time, "Cpu: ", Game.cpu.getUsed());
  if (Game.cpu.bucket == 10000) {
    Game.cpu.generatePixel();
  }
  console.log("End of Tick:", Game.time , " Cpu: ", Game.cpu.getUsed());
}