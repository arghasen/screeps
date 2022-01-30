// Slowdeath 
// A screeps AI
//

import { RoomManager } from "manager/RoomManager";

export class Slowdeath {
    static roomManager_: RoomManager;
    static init() {
        var rooms = Game.rooms;
        for (var roomName in rooms) {
            var room = rooms[roomName];
            console.log(JSON.stringify(room));
            var roomControllerLevel = room.controller ? room.controller.level : 0;
            if (roomControllerLevel == 0) {
                console.log("AI doesnt have capability to work with controller level 0 rooms");
            }
            else if (roomControllerLevel <= 2) {
                console.log("Room Level " + roomControllerLevel + "...starting to work")
                this.roomManager_ = new RoomManager();
                this.roomManager_.init(room)
            }
            else {
                console.log("AI doesnt have capability to work with controller level 0 rooms");
            }
        }
    }

    static run() {
        this.roomManager_.run();
    }
}

