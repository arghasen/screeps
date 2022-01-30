console.log("hello screeps");

import { Slowdeath } from 'SlowDeath';
import { Stats } from './stats/stats';

export function loop() {
    Slowdeath.init()
    Slowdeath.run()
    Stats.run()
}
