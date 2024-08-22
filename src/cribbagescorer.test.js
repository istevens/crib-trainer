'use strict';

import { handFromString } from './cribbagescorer.js';

describe('testing Hand.hasHisNobs', () => {

    const expectHasNobs = (p, e) => {
        var [h, c] = p;
        h = handFromString(h);
        var hasNobs = h.hasHisNobs(c);
        expect(hasNobs).toBe(e);
    }

    test('returns true if suit of jack in hand matches cutCard', () => {
        var play = ["AC 2C JD 4C", "5D"];
        expectHasNobs(play, true);
    });

    test('returns false if suit of jack in hand does not match cutCard', () => {
        var play = ["AC 2C JD 4C", "5C"];
        expectHasNobs(play, false);
    });

    test('returns false if suit of no jack in hand', () => {
        var play = ["AC 2C 3D 4C", "5C"];
        expectHasNobs(play, false);
    });

});

describe('testing Hand.hasFlush', () => {

    const expectHasFlush = (h, e) => {
        h = handFromString(h);
        var hasFlush = h.hasFlush();
        expect(hasFlush).toBe(e);
    }

    test('returns true if all same suit', () => {
        var hand = "AC 2C 3C 4C";
        expectHasFlush(hand, true);
    });

    test('returns false if not all same suit', () => {
        var hand = "AC 2C 3C 4D";
        expectHasFlush(hand, false);
    });
});

describe('testing Hand.findMultiples', () => {

    const findMultiples = (p) => {
        var [h, c] = p;
        h = handFromString(h);
        var multiples = h.findMultiples(c);
        return multiples;
    }

    const expectMultiplesToBe = (p, e) => {
        var m = findMultiples(p);
        expect(m).toEqual(e);
    }

    test('returns only one pair if in hand', () => {
        var play = ["AC 2C 3C 3D", "5D"];
        expectMultiplesToBe(play, [["3C", "3D"]]);
    });

    test('returns only one pair if in hand and cut card', () => {
        var play = ["AC 2C 3C 4D", "3D"];
        expectMultiplesToBe(play, [["3C", "3D"]]);
    });

    test('returns two pair if in hand', () => {
        var play = ["3C 2C 3D 2D", "5D"];
        var m = findMultiples(play);
        expect(m).toContainEqual(["2C", "2D"]);
        expect(m).toContainEqual(["3C", "3D"]);
    });

    test('returns two pair if in hand and cut card', () => {
        var play = ["3C 2C 5D 2D", "3D"];
        var m = findMultiples(play);
        expect(m).toContainEqual(["2C", "2D"]);
        expect(m).toContainEqual(["3C", "3D"]);
    });

    test('returns only one trio if in hand', () => {
        var play = ["AC 3H 3C 3D", "5D"];
        expectMultiplesToBe(play, [["3H", "3C", "3D"]]);
    });

    test('returns only one trio if in hand and cut card', () => {
        var play = ["AC 2H 3C 3D", "3S"];
        expectMultiplesToBe(play, [["3C", "3D", "3S"]]);
    });

    test('returns trio and pair if in hand and cut card', () => {
        var play = ["2C 2H 3C 3D", "3S"];
        var m = findMultiples(play);
        expect(m).toContainEqual(["2C", "2H"]);
        expect(m).toContainEqual(["3C", "3D", "3S"]);
    });

    test('returns only one quad if in hand', () => {
        var play = ["3S 3H 3C 3D", "5D"];
        expectMultiplesToBe(play, [["3S", "3H", "3C", "3D"]]);
    });

    test('returns only one quad if in hand and cut card', () => {
        var play = ["3S 3H 3C 5D", "3D"];
        expectMultiplesToBe(play, [["3S", "3H", "3C", "3D"]]);
    });

});
