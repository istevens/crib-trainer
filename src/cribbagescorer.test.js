'use strict';

import { CribbageHand } from './cribbagescorer.js';

describe('testing Hand.fromString', () => {
    const expectHandsEqual = (v, e) => {
        v = CribbageHand.fromString(v).cards;
        expect(v).toEqual(expect.arrayContaining(e));
    };

    test('returns hand matching string', () => {
        var hand = "AC 2C JD 4C";
        expectHandsEqual(hand, ['AC', '2C', 'JD', '4C']);
    });

    test('returns hand matching string with 10', () => {
        var hand = "AC 2C JD 10C";
        expectHandsEqual(hand, ['AC', '2C', 'JD', '10C']);
    });
});

describe('testing Hand.hasHisNobs', () => {
    const expectHasNobs = (p, e) => {
        var [h, c] = p;
        h = CribbageHand.fromString(h);
        var hasHisNobs = h.hasHisNobs(c);
        expect(hasHisNobs).toBe(e);
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
        h = CribbageHand.fromString(h);
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
        h = CribbageHand.fromString(h);
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

describe('testing Hand.findRuns', () => {
    const findRuns = (p) => {
        var [h, c] = p;
        h = CribbageHand.fromString(h);
        var runs = h.findRuns(c);
        return runs;
    }

    const expectRunsToBe = (p, e) => {
        var m = findRuns(p);
        expect(m).toEqual(e);
    }

    test('returns zero runs if none in hand', () => {
        var play = ["AC 3C 5C 7D", "9D"];
        expectRunsToBe(play, []);
    });

    test('returns only one run of three if in hand', () => {
        var play = ["AC 2C 3C 6D", "5D"];
        expectRunsToBe(play, [["AC", "2C", "3C"]]);
        play = ["6D 4C 2C 5D", "AD"];
        expectRunsToBe(play, [["4C", "5D", "6D"]]);
    });

    test('returns only one run of three if in hand and cut card', () => {
        var play = ["2C AC 5C 6D", "3C"];
        expectRunsToBe(play, [["AC", "2C", "3C"]]);
        play = ["2C AC 5C 4D", "6D"];
        expectRunsToBe(play, [["4D", "5C", "6D"]]);
    });

    test('returns two runs of three if middle card repeats', () => {
        var play = ["AC 2C 3C 2D", "5D"];
        expectRunsToBe(
            play, [
                ["AC", "2C", "3C"],
                ["AC", "2D", "3C"]]
        );
        play = ["4C AC 3C 4D", "5D"];
        expectRunsToBe(
            play, [
                ["3C", "4C", "5D"],
                ["3C", "4D", "5D"]]
        );
    });

    test('returns two runs of three if first card repeats', () => {
        var play = ["AC 2C 3C AD", "5D"];
        expectRunsToBe(
            play, [
                ["AC", "2C", "3C"],
                ["AD", "2C", "3C"]]
        );
        play = ["4C AC 3C 3D", "5D"];
        expectRunsToBe(
            play, [
                ["3C", "4C", "5D"],
                ["3D", "4C", "5D"]]
        );
    });

    test('returns two runs of three if last card repeats', () => {
        var play = ["AC 2C 3C 5D", "3D"];
        expectRunsToBe(
            play, [
                ["AC", "2C", "3C"],
                ["AC", "2C", "3D"]]
        );
        play = ["4C AC 5C 3D", "5D"];
        expectRunsToBe(
            play, [
                ["3D", "4C", "5C"],
                ["3D", "4C", "5D"]]
        );
    });

    test('returns four runs of three if two cards repeat', () => {
        var play = ["2C AC 3C 2D", "3D"];
        expectRunsToBe(
            play, [
                ["AC", "2C", "3C"],
                ["AC", "2C", "3D"],
                ["AC", "2D", "3C"],
                ["AC", "2D", "3D"]]
        );
    });

    test('returns only one run of four if in hand', () => {
        var play = ["AC 2C 3C 4D", "6D"];
        expectRunsToBe(play, [["AC", "2C", "3C", "4D"]]);
    });

    test('returns only one run of four if in hand and cut card', () => {
        var play = ["AC 2C 3C 6D", "4D"];
        expectRunsToBe(play, [["AC", "2C", "3C", "4D"]]);
    });

    test('returns two runs of four if one card repeats', () => {
        var play = ["AC 2C 3C 2D", "4D"];
        expectRunsToBe(
            play, [
                ["AC", "2C", "3C", "4D"],
                ["AC", "2D", "3C", "4D"]]
        );
    });

    test('returns only one run of five if in hand and cut card', () => {
        var play = ["5D 2C 3C 4D", "AC"];
        expectRunsToBe(play, [["AC", "2C", "3C", "4D", "5D"]]);
    });

});

describe('testing Hand.findFifteens', () => {
    const findFifteens = (p) => {
        var [h, c] = p;
        h = CribbageHand.fromString(h);
        var fifteens = h.findFifteens(c);
        return fifteens;
    }

    const expectFifteensToBe = (p, e) => {
        var f = findFifteens(p);
        expect(f.length).toBe(e.length);
        expect(f).toEqual(
            expect.arrayContaining(e.map(expect.arrayContaining))
        );
    }

    test('returns three fifteens with one five and three face cards', () => {
        var play = ["5C KC JC QD", "2D"];
        expectFifteensToBe(
            play, [
                ["5C", "KC"],
                ["5C", "JC"],
                ["5C", "QD"]]
        );
    });

    test('returns six fifteens with two fives and three face cards', () => {
        var play = ["5C KC JC QD", "5D"];
        expectFifteensToBe(
            play, [
                ["5C", "KC"],
                ["5C", "JC"],
                ["5C", "QD"],
                ["5D", "KC"],
                ["5D", "JC"],
                ["5D", "QD"]]
        );
    });

    test('returns seven fifteens with three fives and two face cards', () => {
        var play = ["5C 5S JC QD", "5D"];
        expectFifteensToBe(
            play, [
                ["5C", "JC"],
                ["5C", "QD"],
                ["5S", "JC"],
                ["5S", "QD"],
                ["5D", "JC"],
                ["5D", "QD"],
                ["5C", "5S", "5D"]]
        );
    });

    test('returns six fifteens with three eights and two sevens', () => {
        var play = ["8C 8S 7C 7D", "8D"];
        expectFifteensToBe(
            play, [
                ["8C", "7C"],
                ["8C", "7D"],
                ["8S", "7C"],
                ["8S", "7D"],
                ["8D", "7C"],
                ["8D", "7D"]]
        );
    });

    test('returns six fifteens with three nines and two sixes', () => {
        var play = ["9C 9S 6C 6D", "9D"];
        expectFifteensToBe(
            play, [
                ["9C", "6C"],
                ["9C", "6D"],
                ["9S", "6C"],
                ["9S", "6D"],
                ["9D", "6C"],
                ["9D", "6D"]]
        );
    });

    test('returns one fifteen with three threes and a six', () => {
        var play = ["3C 6S 3S 3D", "KD"];
        expectFifteensToBe(play, [["3C", "6S", "3S", "3D"]]);
    });

    test('returns one fifteen with four threes and a six', () => {
        var play = ["3C 6S 3S 3D", "3H"];
        expectFifteensToBe(play, [
            ["3C", "6S", "3S", "3D"],
            ["6S", "3S", "3D", "3H"],
            ["6S", "3C", "3D", "3H"],
            ["6S", "3C", "3S", "3H"]
        ]);
    });
});
