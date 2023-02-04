import isRoomVisible from "./";
import stubGame from "../../../tests/stub/game";
import stubRoom from "../../../tests/stub/room";

describe("Is Room Visible", () => {
  it("should return true if a room is visible", () => {
    stubGame({
      rooms: [stubRoom("W1N1")]
    });

    expect(isRoomVisible("W1N1")).toBe(true);
  });

  it("should return false if a room is invisible", () => {
    expect(isRoomVisible("W1N2")).toBe(false);
  });
});
