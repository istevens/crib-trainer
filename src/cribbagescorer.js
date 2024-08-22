'use strict';

const JACK = 'J';
const FACES = ('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', JACK, 'Q', 'K');
const SUITS = ('D', 'C', 'H', 'S');

const extendExistingOrCreate = (m,v) => m.set(v[0], (m.get(v[0]) || []).concat(v[1]));

class CribbageHand {

    constructor(cards) {
        cards = cards.map((x) => [x[0], [x[1]]])
        this.cards = cards.reduce(extendExistingOrCreate, new Map());
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

    findMultiples(cutCard) {
        var hand = new Map(this.cards);
        extendExistingOrCreate(hand, cutCard);
        hand = Array.from(hand);
        var multiples = hand.filter((x) => x[1].length > 1);
        multiples = multiples.map((x) => x[1].map((y) => x[0] + y));
        return multiples;
    }
}

export function handFromString(s) {
    var hand = s.split(' ');
    hand = hand.map((x) => Array.from(x));
    hand = new CribbageHand(hand);
    return hand;
}
