'use strict';

const JACK = 'J';
const FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', JACK, 'Q', 'K'];
const SUITS = ['D', 'C', 'H', 'S'];
const fv = (a) => FACES.indexOf(a[0]);
const cardCompare = (a,b) => fv(a) < fv(b) && -1 || fv(a) > fv(b) && 1 || 0;
const extendExistingOrCreate = (m,v) => m.set(v[0], (m.get(v[0]) || []).concat(v[1]));

export class CribbageHand {

    constructor(cards) {
        cards = cards.map((x) => [x[0], [x[1]]])
        this.cards = cards.reduce(extendExistingOrCreate, new Map());
    }

    static fromString(s) {
        var hand = s.split(' ');
        hand = hand.map((x) => [x.slice(0,-1), x.slice(-1)]);
        hand = new CribbageHand(hand);
        return hand;
    }

    hasHisNobs(cutCard) {
        var cutSuit = cutCard[1];
        var jacks = this.cards.get(JACK) || false;
        var jackOfCutSuitIsInHand = jacks && jacks.indexOf(cutSuit) >= 0;
        return jackOfCutSuitIsInHand;
    }

    hasFlush() {
        var suits = Array.from(this.cards.values()).flat();
        suits = new Set(suits).size;
        var hasFlush = suits == 1;
        return hasFlush;
    }

    _includeCutCardWithHand(hand, cutCard) {
        var hand = new Map(this.cards);
        extendExistingOrCreate(hand, cutCard);
        hand = Array.from(hand);
        return hand;
    }

    findMultiples(cutCard) {
        var hand = this._includeCutCardWithHand(this.cards, cutCard);
        var multiples = hand.filter((x) => x[1].length > 1);
        multiples = multiples.map((x) => x[1].map((y) => x[0] + y));
        return multiples;
    }

    findRuns(cutCard) {
        var hand = this._includeCutCardWithHand(this.cards, cutCard);
        hand = hand.toSorted(cardCompare);

        var isInRun = (a, x) => a.length == 0 || fv(a.at(-1)) + 1 == fv(x);
        var addIfInRun = (a, x) => isInRun(a, x) && a.concat([x]) || a;
        var resetRun = (a) => (a.length < 3 && []);
        var combineFaceAndSuits = (x) => x[1].map((y) => x[0]+y);
        var runs = hand.reduce((a, x) => addIfInRun(a, x) || resetRun(a), []);
        runs = runs.map(combineFaceAndSuits);

        var addToNewRun = (runs, cards) => runs.length == 0 && [[cards]];
        var addCardToRuns = (runs, card) => runs.map((y) => y.concat(card));
        var combineRuns = (runs, cards) => cards.map(
            (card) => addToNewRun(runs, card) || addCardToRuns(runs, card)
        ).flat();
        runs = runs.reduce(combineRuns, []);
        return runs;
    }
}
