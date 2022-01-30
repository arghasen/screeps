import { ScreepsPrometheus, Prefix, Gauge, Label } from '@brainwart/screeps-prometheus-game';

/**
 * Basic statistics stored in Memory in Prometheus Format
 */

export class Stats {
    static run() {
        const prom = new ScreepsPrometheus();
        const cpu = prom.add(Prefix, 'cpu');
        cpu.add(Gauge, 'used', Game.cpu.getUsed());
        cpu.add(Gauge, 'bucket', Game.cpu.bucket);

        const tick = prom.add(Prefix, 'tick')
        tick.add(Gauge, 'tick', Game.time)

        const rooms = prom.add(Prefix, 'roomSummary');

        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];

            if (room.controller && room.controller.my) {
                const roomSummary = rooms.add(Label, 'roomName', roomName);

                const controller = roomSummary.add(Prefix, 'controller');
                controller.add(Gauge, 'level', room.controller.level, 'Current controller level');
                controller.add(Gauge, 'progress', room.controller.progress);
                controller.add(Gauge, 'progressNeeded', room.controller.progressTotal);
                controller.add(Gauge, 'downgrade', room.controller.ticksToDowngrade);

                const storage = roomSummary.add(Prefix, 'storage');
                storage.add(Gauge, 'energy', room.energyAvailable);
                storage.add(Gauge, 'storage', room.storage ? room.storage.store.energy : 0);
                storage.add(Gauge, 'terminal', room.terminal ? room.terminal.store.energy : 0);
                
                //TODO: add mining gauges
                // const mining = roomSummary.add(Prefix, 'mining');
                // for(source in room.)
                // mining.add(Gauge, 'energy')

            }
        }

        const GlobalController = prom.add(Prefix, 'global_controller');
        GlobalController.add(Gauge, 'level', Game.gcl.level, 'Current controller level');
        GlobalController.add(Gauge, 'progress', Game.gcl.progress);
        GlobalController.add(Gauge, 'progressNeeded', Game.gcl.progressTotal);

        Memory.stats = prom.build();
    }
}
