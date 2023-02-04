import sourcesInRoom from "./";

import stubConstants from "../../../tests/stub/constants";
import stubGame from "../../../tests/stub/game";
import stubRoom from "../../../tests/stub/room";
import stubObject from "../../../tests/stub/object";

describe("Sources in Room", () => {
  beforeAll(() => {
    stubGame({
      objectsById: {
        foo: stubObject({
          id: "foo",
          type: "source" 
        }),
        bar: stubObject({
          id: "bar",
          type: "source"
        })
      }
    });

    stubConstants();
  });

  it("should find sources", () => {
    let room = stubRoom("W1N1", {
      objects: ["foo", "bar"]
    });

    let sources = sourcesInRoom(room);

    expect(sources.length).toBe(2);
  });
});
