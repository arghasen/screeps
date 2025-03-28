import { color, onPublicServer } from "./utils/utils";
import { Kernel } from "./os/kernel";
import { NOT_RUNNING } from "./os/process";
import { Stats } from "./stats/stats";
import { gitVersion } from "./utils/version";
import { logger } from "./utils/logger";

export function loop(): void {
  logger.info(`${color("Beginning of new tick", "Magenta")}`);
  logger.info(`Begin of Tick Cpu: ${Game.cpu.getUsed()}`);
  initializeMemory();

  const kernel = new Kernel();
  kernel.start();
  kernel.run();
  kernel.shutdown();
  logger.info(`Pre Stats Tick Cpu: ${color(Game.cpu.getUsed(), "red")}`);
  Stats.run();
  logger.info(`Post Stats Tick Cpu: ${Game.cpu.getUsed()}`);

  if (onPublicServer() && Game.cpu.bucket === 10000) {
    Game.cpu.generatePixel();
  }
  if (Memory.gcl && !Memory.gcl[Game.gcl.level]) {
    Memory.gcl[Game.gcl.level] = Game.time;
  }
  logger.info(`End of Tick Cpu: ${Game.cpu.getUsed()}`);
  logger.info(`CPU bucket left ${Game.cpu.bucket}`);
}

function initializeMemory() {
  if (!Memory.os) {
    logger.info("No kernel memory found, recreating");
    const processes = {
      running: NOT_RUNNING,
      ready: [],
      completed: [],
      waiting: [],
      sleeping: [],
      index: {},
      count: 0
    };
    const scheduler = { processes };
    Memory.os = { scheduler };
  }
  Memory.version = gitVersion;
  if (!Memory.gcl) {
    Memory.gcl = {};
  }
}
