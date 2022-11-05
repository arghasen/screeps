import isObjectVisible from "./";

import stubGame from "../stub/game";
import stubObject, { StubId} from "../stub/object";

describe("Is Object Visible", () => {
  beforeAll(() => {
    stubGame({
      objectsById: {
        foo:stubObject({
          id: "foo",
          type: "source"
        }),
      }
    });
  });

  it("should return true if the object is visible", () => {
    expect(isObjectVisible("foo" as Id<StubId>)).toBe(true);
  });

  it("should return false if the object is hidden", () => {
    expect(isObjectVisible("bar" as Id<StubId>)).toBe(false);
  });
});
