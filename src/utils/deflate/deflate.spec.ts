import deflate from "./";

describe("Deflate", () => {
  it("should deflate a list of objects", () => {
    const objects = [{ id: "ab" }, { id: "cb" }];

    const ids = deflate(objects);

    expect(ids.length).toBe(2);
    expect(ids[0]).toBe("ab");
  });
});
