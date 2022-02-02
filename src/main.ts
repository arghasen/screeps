console.log('hello screeps');

import { Slowdeath } from './SlowDeath';
import { Stats } from './stats/stats';

export function loop() {
  if(!Memory.count){
      Memory.count =0;
  }
  Slowdeath.init();
  Slowdeath.run();
  Stats.run();
  if (Game.cpu.bucket == 10000) {
    Game.cpu.generatePixel();
  }
  console.log("End of Tick:" + Game.time + " Cpu: "+ Game.cpu.getUsed());
}