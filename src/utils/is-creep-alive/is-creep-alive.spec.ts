import isCreepAlive from "./";
import stubGame from "../../../tests/stub/game";
import stubCreep from "../../../tests/stub/creep";

describe("Is Creep Alive", () => {
  it("should return false if the creep is dead", () => {
    stubGame();

    expect(isCreepAlive("test")).toBe(false);
  });

  it("should return true if the creep is alive", () => {
    stubGame({
      creeps: [
        stubCreep({
          name: "test",
          body: []
        })
      ]
    });

    expect(isCreepAlive("test")).toBe(true);
  });
});
