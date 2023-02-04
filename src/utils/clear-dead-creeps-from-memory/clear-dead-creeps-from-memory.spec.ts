import clearDeadCreepsFromMemory from "./";
import stubMemory from "../../../tests/stub/memory";
import stubGame from "../../../tests/stub/game";
import stubCreep from "../../../tests/stub/creep";

describe("Clear Dead Creeps From Memory", () => {
  it("should remove dead creeps", () => {
    stubMemory({
      creeps: {
        foo: { foo: "bar" },
        bar: { foo: "bar" }
      }
    });
    stubGame({
      creeps: [
        stubCreep({
          name: "foo",
          body: []
        })
      ]
    });

    expect(Object.keys(Memory.creeps).length).toBe(2);

    clearDeadCreepsFromMemory();

    expect(Object.keys(Memory.creeps).length).toBe(1);
  });
});
