export function color(str: string | number, colorName: string): string {
  return `<span style="color: ${colorName};">${str}</span>`;
}

export function printRoomName(roomName: string): string {
  return `<a href="#!/room/' ${Game.shard.name} / ${roomName}> ${roomName} </a>`;
}

export function onPublicServer(): boolean {
  return Game.shard.name.includes("shard");
}
