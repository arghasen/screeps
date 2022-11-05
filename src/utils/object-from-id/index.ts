/**
 * Get an object from its ID.
 *
 * @param id The id of the object you want to retrive
 */
export default function objectFromId<T extends _HasId>(id: Id<T>) {
  return Game.getObjectById<T>(id);
}
