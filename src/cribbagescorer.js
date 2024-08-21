'use strict';

const JACK = 'J';
const FACES = ('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', JACK, 'Q', 'K');
const SUITS = ('D', 'C', 'H', 'S');

class CribbageHand extends Array {

    hasHisNobs(cutCard) {
        const cutSuit = cutCard[1];
        var jackOfCutSuitIsInHand = this.some((x) => x[0] == JACK && x[1] == cutSuit);
        return jackOfCutSuitIsInHand;
    }
}

export function handFromString(s) {
    var hand = s.split(' ');
    hand = hand.map((x) => Array.from(x));
    hand = CribbageHand.from(hand);
    return hand;
}

export function handAllSameSuit(hand) {
}

