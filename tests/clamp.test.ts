import { describe, test, expect, expectTypeOf } from 'vitest';
import { clamp } from '../src/utilities/Clamp.js';

describe('Clamp Function', () => {
    const array = ["hello", "world", "this", "is", "a", "test"];
    const numberArray = [1, 2, 3, 4, 5, 6, 7, 8];
    const compositeArray = ["hello", 1];
    
    test("Returns Correct Array", () => {
        const clamped = clamp(array, 2);

        expect(clamped).toStrictEqual(["hello", "world"]);
        expect(clamped.length).toStrictEqual(2);
    });

    test("Typings", () => {
        const clamped = clamp(array, 2);
        expectTypeOf(clamped).toEqualTypeOf<string[]>();

        const clampedNumbers = clamp(numberArray, 5);
        expectTypeOf(clampedNumbers).toEqualTypeOf<number[]>();

        const clampedComposite = clamp(compositeArray, 1);
        expectTypeOf(clampedComposite).toEqualTypeOf<(string | number)[]>();
    });
});