export interface StubId {
  id: Id<this>;
}
interface StubObjectOptions {
  id: string;
  type: StructureConstant | "source";
}

export default function stubObject(options: StubObjectOptions) {
  return {
    type: options.type,
    id: options.id as Id<StubId>
  };
}
