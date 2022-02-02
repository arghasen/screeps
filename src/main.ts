console.log('hello screeps');

import { VERSION } from 'lodash';
import { Slowdeath } from 'SlowDeath';
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
}