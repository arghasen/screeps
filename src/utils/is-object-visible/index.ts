/**
 * Returns true if the object is visible to your code.
 * 
 * @param id the id of the object to check
 */
export default function isObjectVisible<T extends _HasId>(id: Id<T>) {
  return !!Game.getObjectById(id);
}
