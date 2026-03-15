
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
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}