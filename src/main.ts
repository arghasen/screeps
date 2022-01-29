
console.log("hello screeps");

import { ScreepsPrometheus,Prefix,Gauge,Label } from '@brainwart/screeps-prometheus-game';

export function loop() {
const prom = new ScreepsPrometheus();
const cpu = prom.add(Prefix, 'cpu');
cpu.add(Gauge, 'used', Game.cpu.getUsed());
cpu.add(Gauge, 'bucket', Game.cpu.bucket);

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

    if (room.storage) {
      const storage = roomSummary.add(Prefix, 'storage');
      storage.add(Gauge, 'energy', 20);
    }
  }
}

Memory.stats = prom.build();
} 
