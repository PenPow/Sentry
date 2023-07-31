import { describe, test, expect } from 'vitest';
import { clamp } from '../src/utilities/Clamp.js';

describe('Clamp Function', () => {
    const array = ["hello", "world", "this", "is", "a", "test"];
    
    test("Returns Correct Array", () => {
        const clamped = clamp(array, 2);

        expect(clamped).toStrictEqual(["hello", "world"]);
        expect(clamped.length).toStrictEqual(2);
    });
});