export function clamp<T extends unknown[]>(array: T, length: number): T {
    const arr = [...array] as T;
    arr.length = Math.min(arr.length, length);
  
    return arr;
}