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
