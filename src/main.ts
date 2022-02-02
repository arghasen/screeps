console.log('hello screeps');

import { Slowdeath } from 'SlowDeath';
import { Stats } from './stats/stats';

export function loop() {
  Memory.version = 'valphatest2';
  Slowdeath.init();
  Slowdeath.run();
  Stats.run();
  if (Game.cpu.bucket == 10000) {
    Game.cpu.generatePixel();
  }
}
