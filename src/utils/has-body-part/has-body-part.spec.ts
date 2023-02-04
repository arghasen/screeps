import hasBodyPart from "./";

import stubCreep from "../../../tests//stub/creep";
import stubConstants from "../../../tests/stub/constants";

describe("Has Body Part", () => {
  beforeAll(() => {
    stubConstants();
  });

  it("should return a boolean value", () => {
    const creep = stubCreep({
      name: "foo",
      body: [MOVE, CARRY]
    });

    expect(hasBodyPart(creep, MOVE)).toBe(true);
    expect(hasBodyPart(creep, ATTACK)).toBe(false);
  });
});
