import stubObject from "../../../tests//stub/object";
import deflate from "./";

describe("Deflate", () => {
  it("should deflate a list of objects", () => {
    const objects = [
      stubObject({ id: "ab", type: "source" }),
      stubObject({ id: "cd", type: "source" })
    ];

    const ids = deflate(objects);

    expect(ids.length).toBe(2);
    expect(ids[0]).toBe("ab");
  });
});
