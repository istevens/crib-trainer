'use strict';

import CribbageHand from './cribbagescorer.js';

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

describe('testing Hand.randomPlay', () => {
    test('returns play with four cards in hand', () => {
        var play = CribbageHand.randomPlay();
        expect(play.hand.cards.length).toBe(4);
    });

    test('returns play with four cards have values', () => {
        var play = CribbageHand.randomPlay();
        expect(play.hand.cards).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/[A12-9JQK]0?[SCDH]/)
            ])
        );
    });

    test('returns play with cut card', () => {
        var play = CribbageHand.randomPlay();
        expect(play.cutCard);
    });

    test('returns play with four cards have values', () => {
        var play = CribbageHand.randomPlay();
        expect(play.cutCard).toEqual(expect.stringMatching(/[A12-9JQK]0?[SCDH]/));
    });
});

describe('testing Hand.findHisNobs', () => {
    const expectNobsToBe = (p, e) => {
        var [h, c] = p;
        h = CribbageHand.fromString(h);
        var hisNobs = h.findHisNobs(c);
        expect(hisNobs).toEqual(expect.arrayContaining(e));
    }

    test('returns nobs if suit of jack in hand matches cutCard', () => {
        var play = ["AC 2C JD 4C", "5D"];
        expectNobsToBe(play, ["5D", "JD"]);
    });

    test('returns empty if suit of jack in hand does not match cutCard', () => {
        var play = ["AC 2C JD 4C", "5C"];
        expectNobsToBe(play, []);
    });

    test('returns empty if suit of no jack in hand', () => {
        var play = ["AC 2C 3D 4C", "5C"];
        expectNobsToBe(play, []);
    });

});

describe('testing Hand.findFlush', () => {

    const expectHasFlush = (h, e, cut) => {
        h = CribbageHand.fromString(h);
        var flush = h.findFlush(cut);
        expect(flush).toEqual(expect.arrayContaining(e));
    }

    test('returns flush if all same suit', () => {
        var hand = "AC 2C 3C 4C";
        expectHasFlush(hand, hand.split(" "), "4D");
    });

    test('returns empty if not all same suit', () => {
        var hand = "AC 2C 3C 4D";
        expectHasFlush(hand, [], "5C");
    });

    test('returns true if all same suit with cut card', () => {
        var hand = "AC 2C 3C 4C";
        expectHasFlush(hand, ["AC", "2C", "3C", "4C", "5C"], "5C");
    });

    test('returns true if all same suit with cut card', () => {
        var hand = "AC 2C 3C 4C";
        expectHasFlush(hand, [], "5D");
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

    test('returns none if none in hand', () => {
        var play = ["AC 2C 3C 4D", "5D"];
        expectMultiplesToBe(play, []);
    });

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
        expectMultiplesToBe(play, [
            ["2C", "2D"],
            ["3C", "3D"]
        ]);
    });

    test('returns two pair if in hand and cut card', () => {
        var play = ["3C 2C 5D 2D", "3D"];
        expectMultiplesToBe(play, [
            ["2C", "2D"],
            ["3C", "3D"]
        ]);
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
        expectMultiplesToBe(play, [
            ["2C", "2H"],
            ["3C", "3D", "3S"]
        ]);
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

    test('returns zero fifteens if none in hand', () => {
        var play = ["AC AD AS AD", "2D"];
        expectFifteensToBe(play, []);
    });

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

    test('Ten card is handled as ten value', () => {
        var play = ["QD 4S AD QH", "10D"];
        expectFifteensToBe(play, [
            [ "QD", "4S", "AD" ],
            [ "10D", "4S", "AD" ],
            [ "QH", "4S", "AD" ]
        ]);
    });
});

describe('testing Hand.getScore', () => {
    const getScore = (p) => {
        var [h, c] = p;
        h = CribbageHand.fromString(h);
        var score = h.getScore(c);
        return score;
    }

    const expectScoreToBe = (p, s) => {
        var score = getScore(p);
        expect(score).toBe(s);
    }

    test('returns 0 with no tricks', () => {
        var play = ["AC 3S 6S QD", "JH"];
        expectScoreToBe(play, 0);
    });

    test('returns 2 with one fifteen', () => {
        var play = ["9C 3S 5S QD", "8H"];
        expectScoreToBe(play, 2);
    });

    test('returns 2 with one pair', () => {
        var play = ["3C 3S 10S QD", "8H"];
        expectScoreToBe(play, 2);
    });

    test('returns 6 with one triplet', () => {
        var play = ["3C 3S 3D QD", "8H"];
        expectScoreToBe(play, 6);
    });

    test('returns 12 with four-of-a-kind', () => {
        var play = ["3C 3S 3D 3H", "8H"];
        expectScoreToBe(play, 12);
    });

    test('returns 3 with run of three', () => {
        var play = ["9C 10S 8S AD", "2H"];
        expectScoreToBe(play, 3);
    });

    test('returns 4 with run of four', () => {
        var play = ["9C 10S 8S JD", "2H"];
        expectScoreToBe(play, 4);
    });

    test('returns 5 with run of five', () => {
        var play = ["9C 10S 8S JD", "QH"];
        expectScoreToBe(play, 5);
    });

    test('returns 1 with his nobs', () => {
        var play = ["AC 10S 8S JH", "2H"];
        expectScoreToBe(play, 1);
    });

    test('returns 4 with flush in hand', () => {
        var play = ["AS 10S 8S KS", "2H"];
        expectScoreToBe(play, 4);
    });

    test('returns 5 with flush including cut card', () => {
        var play = ["AS 10S 8S KS", "2S"];
        expectScoreToBe(play, 5);
    });

    test('returns 29 with 4 fives and jack of cut suit', () => {
        var play = ["JC 5S 5H 5D", "5C"];
        expectScoreToBe(play, 29);
    });

    test('smokeTest', () => {
        expectScoreToBe(["QD 4S AD QH", "10D"], 8);
        expectScoreToBe(["2S 6D 2C 8D", "6C"], 4);
        expectScoreToBe(["3S 4C 5D KC", "10H"], 7);
        expectScoreToBe(["6H 7H 8H 7C", "AH"], 16);
        expectScoreToBe(["KS KD 3H JC", "8C"], 3);
        expectScoreToBe(["5D 4C 4H 6S", "6C"], 24);
        expectScoreToBe(["9S 7H KS 3H", "4S"], 0);
        expectScoreToBe(["3D 2S 2D AH", "2H"], 15);
        expectScoreToBe(["8S AS 9S 7S", "5D"], 11);
    });
});

describe('testing Hand.getTricks', () => {

    var getTricks = (play) => {
        var hand = CribbageHand.fromString(play[0]);
        var cutCard = play[1];
        var tricks = hand.getTricks(cutCard);
        return tricks;
    }

    var expectPropEqualsRelatedCall = (play, prop) => {
        var hand = CribbageHand.fromString(play[0]);
        var cutCard = play[1];
        var tricks = getTricks(play);
        var call = prop.startsWith('has') && prop || 'find' + prop[0].toUpperCase() + prop.slice(1);
        expect(tricks[prop]).toEqual(hand[call](cutCard));
    }

    var expectPropToEqual = (play, prop, exp) => {
        var tricks = getTricks(play);
        expect(tricks[prop]).toEqual(exp);
    }

    test('returns nobs and cut card', () => {
        expectPropToEqual(["AC 2C JD 4C", "5D"], 'hisNobs', [['5D', 'JD']]);
        expectPropToEqual(["AC 2C 3D 4C", "5C"], 'hisNobs', []);
    });

    test('returns flush', () => {
        expectPropToEqual(["AC 2C 3C 4D", "5C"], 'flush', []);
        expectPropToEqual(["AC 2C 3C 4C", "5C"], 'flush', [["AC","2C","3C","4C","5C"]]);
        expectPropToEqual(["AC 2C 3C 4C", "5D"], 'flush', [["AC","2C","3C","4C"]]);
    });

    test('returns pairs', () => {
        expectPropToEqual(["AC 2C 3C 4D", "5C"], 'pairs', []);
        expectPropToEqual(["AC 2C 3C 3D", "5C"], 'pairs', [["3C", "3D"]]);
        expectPropToEqual(["2C 2H 3C 3D", "5C"], 'pairs', [["2C", "2H"], ["3C", "3D"]]);
        expectPropToEqual(["2C 2H 3C 3D", "3S"], 'pairs', [["2C", "2H"]]);
    });

    test('returns triples', () => {
        expectPropToEqual(["AC 2C 3C 4D", "5C"], 'triples', []);
        expectPropToEqual(["AC 2C 3C 3D", "3S"], 'triples', [["3C", "3D", "3S"]]);
        expectPropToEqual(["2C 2H 3C 3D", "3S"], 'triples', [["3C", "3D", "3S"]]);
    });

    test('returns quadruples', () => {
        expectPropToEqual(["AC 2C 3C 4D", "5C"], 'quadruples', []);
        expectPropToEqual(["AC 3H 3C 3D", "3S"], 'quadruples', [["3H", "3C", "3D", "3S"]]);
        expectPropToEqual(["3H 3C 3D 3S", "AC"], 'quadruples', [["3H", "3C", "3D", "3S"]]);
    });

    test('returns results of findRuns', () => {
        expectPropEqualsRelatedCall(["AC 3C 5C 7D", "9D"], 'runs');
        expectPropEqualsRelatedCall(["2C AC 3C 2D", "3D"], 'runs');
    });

    test('returns results of findFifteens', () => {
        expectPropEqualsRelatedCall(["AC AD AS AD", "2D"], 'fifteens');
        expectPropEqualsRelatedCall(["5C 5S JC QD", "5D"], 'fifteens');
    });
});
