import { s } from "@sapphire/shapeshift";

export const PermissionsValidator = s.union(
    s.bigint.positive.transform((value) => value.toString()),
    s.number.safeInt.positive.transform((value) => value.toString()),
    s.string.regex(/^[0-9]\d*$/),
);