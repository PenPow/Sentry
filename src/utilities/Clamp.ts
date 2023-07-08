export function clamp<T extends unknown[]>(array: T, length: number): T {
    array.length = Math.min(array.length, length);
  
    return array;
}