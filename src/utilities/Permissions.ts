import { s } from "@sapphire/shapeshift";

export const PermissionsValidator = s.union(
    s.bigint.transform((value) => value.toString()),
    s.number.safeInt.transform((value) => value.toString()),
    s.string.regex(/^\d+$/),
);