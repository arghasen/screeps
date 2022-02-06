import { Kernel } from 'os/kernel';
import { Stats } from './stats/stats';
import { logger } from './utils/logger';
import { color, onPublicServer } from './utils/utils';
import { loader } from 'os/loader';

export function loop(): void {
  logger.info(`${color('Beginning of new tick', 'Magenta')}`);
  logger.info(`Begin of Tick Cpu: ${Game.cpu.getUsed()}`);

  const kernel = new Kernel();
  kernel.start();
  kernel.run();
  kernel.shutdown();
  logger.info(`Pre Stats Tick Cpu: ${color(Game.cpu.getUsed(), 'pink')}`);
  Stats.run();
  logger.info(`Post Stats Tick Cpu: ${Game.cpu.getUsed()}`);

  if (onPublicServer() && Game.cpu.bucket === 10000) {
    Game.cpu.generatePixel();
  }
  logger.info(`End of Tick Cpu: ${Game.cpu.getUsed()}`);
}
