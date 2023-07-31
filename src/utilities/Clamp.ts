import { Mutable } from "../types/Mutable.js";

export function clamp<T extends unknown[]>(array: T, length: number): Mutable<T> {
    const arr = [...array] as Mutable<T>; // create copy of array
    arr.length = Math.min(arr.length, length);
  
    return arr;
}