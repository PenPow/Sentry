import { s } from "@sapphire/shapeshift";

// Own implementation of https://github.com/sapphiredev/framework/issues/334 until they ship a proper method
type PreconditionString = string;
type RecursivePreconditionStrings = (PreconditionString | RecursivePreconditionStrings)[];

export function and(...entries: RecursivePreconditionStrings) {
  return entries;
}

export function or(...entries: RecursivePreconditionStrings) {
  return entries;
}

export const PreconditionContextSchema = s.object({ err: s.string, silent: s.boolean }).partial;
