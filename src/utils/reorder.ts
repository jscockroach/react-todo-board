
/**
 * Reorders an array by moving an item from startIndex to endIndex.
 * Returns a new array without mutating the original.
 *
 * @param list - The source array
 * @param startIndex - Index of the item to move
 * @param endIndex - Index to move the item to
 * @returns A new reordered array
 */
export function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  // Validate indices to avoid inserting `undefined` when `startIndex` is out of bounds.
  if (startIndex < 0 || startIndex >= list.length) {
    throw new RangeError(
      `reorder: startIndex ${startIndex} is out of bounds for list of length ${list.length}`,
    );
  }
  if (endIndex < 0 || endIndex > list.length) {
    throw new RangeError(
      `reorder: endIndex ${endIndex} is out of bounds for list of length ${list.length}`,
    );
  }

  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}