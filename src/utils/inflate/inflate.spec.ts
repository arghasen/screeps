import inflate from "./";
import stubGame from "../../../tests/stub/game";
import stubObject, { StubId} from "../../../tests/stub/object";

describe("Inflate", () => {
  beforeAll(()=>{
    stubGame({
      objectsById: {
        foo: stubObject({
          id: "foo" ,
          type: "source"
        }),
        bar: stubObject({
          id: "bar",
          type: "source"
        }),
        baz: stubObject({
          id: "bar",
          type: "source"
        }),
      }

    });
  });

  it("should accept an array of IDs", () => {
    const ids:Id<StubId>[]  = ["foo" as Id<StubId>, "bar" as Id<StubId>, "baz" as Id<StubId>];

    let objects = inflate(ids);

    expect(objects.length).toBe(3);
  });

  it("it will inflate correctly if Id exists", () => {
    const ids:Id<StubId>[]  = ["foo" as Id<StubId>];

    let objects = inflate(ids);

    expect(objects.length).toBe(1);
    expect(objects[0]?.id).toBe("foo");
  });

  it("it will give undefined object if Id doesnt exist", () => {
    const ids:Id<StubId>[]  = ["ab" as Id<StubId>];

    let objects = inflate(ids);

    expect(objects.length).toBe(1);
    expect(objects[0]?.id).toBe(undefined);
  });
});
