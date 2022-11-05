import objectsFromIds from "../objects-from-ids";

/**
 * Infalte is an alias for `objectsFromIds`
 *
 * @see objectsFromIds
 */
export default function inflate<T extends _HasId>(ids: Id<T>[]) {
  return objectsFromIds<T>(ids);
}
