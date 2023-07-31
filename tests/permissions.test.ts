import { describe, test, expect, vi } from "vitest";
import { PermissionsValidator } from "../src/utilities/Permissions.js";
import { BaseError } from "@sapphire/shapeshift";
import { PermissionFlagsBits, PermissionsBitField } from "discord.js";

const parseFn = vi.fn((bits: unknown) => {
    try {
        return PermissionsValidator.parse(bits);
    } catch(error) {
        return error;
    }
});

describe("Permissions Validator", () => {
    test("Validates Numbers", () => {
        expect(parseFn(1 << 3)).toStrictEqual("8");
        expect(parseFn(0x0000000000000008)).toStrictEqual("8");
    });

    test("Validates Bigints", () => {
        expect(parseFn(1n << 3n)).toStrictEqual("8");
        expect(parseFn(0x0000000000000008n)).toStrictEqual("8");
    });

    test("Validates Stringified Bits", () => {
        expect(parseFn("8")).toStrictEqual("8");
    });

    test("Validates PermissionsBitField's valueOf()", () => {
        expect(parseFn(new PermissionsBitField(PermissionsBitField.Flags.Administrator).valueOf())).toStrictEqual("8");
    });

    test("Validates PermissionsBitField.Flags", () => {
        expect(parseFn(PermissionsBitField.Flags.Administrator)).toStrictEqual("8");
    });

    test("Validates PermissionFlagBits", () => {
        expect(parseFn(PermissionFlagsBits.Administrator)).toStrictEqual("8");
    });

    test("Validates Multiple Permissions", () => {
        expect(parseFn(1 << 3 | 1 << 2)).toStrictEqual("12");
    });

    test("Validates 0", () => {
        expect(parseFn(0)).toStrictEqual("0");
    });

    test("Supports Large Bits", () => {
        expect(parseFn(1 << 46)).toStrictEqual("16384");
    });

    test("Values Coerced to String", () => {
        expect(parseFn(8)).toBeTypeOf("string");
    });

    test("Errors on invalid (negative, decimal) number", () => {
        expect(parseFn(-1)).toBeInstanceOf(BaseError);
        expect(parseFn(2.5)).toBeInstanceOf(BaseError);
    });

    test("Errors on invalid string", () => {
        expect(parseFn("invalid")).toBeInstanceOf(BaseError);
        expect(parseFn("1.5")).toBeInstanceOf(BaseError);
        expect(parseFn("-10")).toBeInstanceOf(BaseError);
    });
});