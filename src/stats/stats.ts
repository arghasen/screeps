import { Gauge, Label, Prefix, ScreepsPrometheus } from "@brainwart/screeps-prometheus-game";

/**
 * Basic statistics stored in Memory in Prometheus Format
 */

export class Stats {
  public static init(): void {
    if (!Memory.stats) {
      Memory.stats = {};
    }
  }
  public static run(): void {
    Stats.init();

    const prom: ScreepsPrometheus = new ScreepsPrometheus();
    const cpu: Prefix = prom.add(Prefix, "cpu");

    cpu.add(Gauge, "used", Game.cpu.getUsed());
    cpu.add(Gauge, "bucket", Game.cpu.bucket);

    const tick: Prefix = prom.add(Prefix, "tick");
    tick.add(Gauge, "tick", Game.time);

    const rooms: Prefix = prom.add(Prefix, "roomSummary");

    for (const roomName of Object.keys(Game.rooms)) {
      const room: Room = Game.rooms[roomName];

      if (room.controller !== undefined && room.controller.my) {
        const roomSummary: Label = rooms.add(Label, "roomName", roomName);

        const controller: Prefix = roomSummary.add(Prefix, "controller");
        controller.add(Gauge, "level", room.controller.level, "Current controller level");
        controller.add(Gauge, "progress", room.controller.progress);
        controller.add(Gauge, "progressNeeded", room.controller.progressTotal);
        controller.add(Gauge, "downgrade", room.controller.ticksToDowngrade);

        const storage: Prefix = roomSummary.add(Prefix, "storage");
        storage.add(Gauge, "energy", room.energyAvailable);
        storage.add(Gauge, "storage", room.storage !== undefined ? room.storage.store.energy : 0);
        storage.add(
          Gauge,
          "terminal",
          room.terminal !== undefined ? room.terminal.store.energy : 0
        );
      }
    }

    const globalController: Prefix = prom.add(Prefix, "global_controller");
    globalController.add(Gauge, "level", Game.gcl.level, "Current controller level");
    globalController.add(Gauge, "progress", Game.gcl.progress);
    globalController.add(Gauge, "progressNeeded", Game.gcl.progressTotal);

    Memory.stats = prom.build();
  }
}
