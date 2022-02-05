import { Kernel } from 'os/kernel';
import { Stats } from './stats/stats';
import { logger } from './utils/logger';
import { onPublicServer } from './utils/utils';

export function loop(): void {
  logger.info(`Begin of Tick Cpu: ${Game.cpu.getUsed()}`);

  const kernel = new Kernel();
  kernel.start();
  kernel.run();
  kernel.shutdown();
  logger.info(`Pre Stats Tick Cpu: ${Game.cpu.getUsed()}`);
  Stats.run();
  logger.info(`Post Stats Tick Cpu: ${Game.cpu.getUsed()}`);
  
  if (onPublicServer() && Game.cpu.bucket === 10000) {
    Game.cpu.generatePixel();
  }
  logger.info(`End of Tick Cpu: ${Game.cpu.getUsed()}`);
}
