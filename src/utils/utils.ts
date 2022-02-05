export function color(str: string, colorName: string): string {
  return `<font color='${colorName}'>${str}</font>`;
}

export function printRoomName(roomName: string): string {
  return `<a href="#!/room/' ${Game.shard.name} / ${roomName}> ${roomName} </a>`;
}

export function onPublicServer(): boolean {
  return Game.shard.name.includes('shard');
}
