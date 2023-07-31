import { describe, test, expectTypeOf } from 'vitest';
import { clamp } from '../src/utilities/Clamp.js';
import { Schema, loadEnv } from '../src/utilities/env.js';

describe('TS Typings', () => {
    describe("Clamp", () => {
        const array = ["hello", "world", "this", "is", "a", "test"];
        const numberArray = [1, 2, 3, 4, 5, 6, 7, 8];
        const compositeArray = ["hello", 1];
    
        test("Typings", () => {
            const clamped = clamp(array, 2);
            expectTypeOf(clamped).toEqualTypeOf<string[]>();
    
            const clampedNumbers = clamp(numberArray, 5);
            expectTypeOf(clampedNumbers).toEqualTypeOf<number[]>();
    
            const clampedComposite = clamp(compositeArray, 1);
            expectTypeOf(clampedComposite).toEqualTypeOf<(string | number)[]>();
        });
    });

    describe("ENV", () => {
        test("Produces Correct Typings", () => {
            expectTypeOf(loadEnv()).toEqualTypeOf<Schema>();
        });
    });
});