'use strict';

const JACK = 'J';
const FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', JACK, 'Q', 'K'];
const SUITS = ['C', 'D', 'S', 'H'];
const DECK = SUITS.flatMap(s => FACES.map(f => f+s));
const fv = a => !a && -1 || FACES.indexOf(a.slice(0, -1));
const cardCompare = (a, b) => fv(a) < fv(b) && -1 || fv(a) > fv(b) && 1 || 0;

export default class CribbageHand {

    constructor(cards) {
        this.cards = cards;
    }

    static fromString(s) {
        var hand = s.split(' ');
        hand = new CribbageHand(hand);
        return hand;
    }

    static randomPlay() {
        function* dealCards(d) {
            var drawRandomCard = () => {
                var n = Math.random() * d.length;
                var card = d.at(n);
                d = d.toSpliced(n, 1);
                return card;
            }

            while(d.length > 0) {
                yield drawRandomCard();
            }
        }

        var cards = dealCards(DECK);
        var hand = new Array(4).fill().map(() => cards.next().value);
        hand = new CribbageHand(hand);
        var cutCard = cards.next().value;

        return {hand: hand, cutCard: cutCard};
    }

    findHisNobs(cutCard) {
        var cutSuit = cutCard[1];
        var jackOfCutSuit = JACK + cutSuit;
        var jackOfCutSuitIsInHand = this.cards.includes(jackOfCutSuit);
        var hisNobs = jackOfCutSuitIsInHand && [cutCard, jackOfCutSuit] || [];
        return hisNobs;
    }

    _includeCutCardWithHand(cutCard) {
        var hand = this.cards.slice();
        hand = hand.concat(cutCard);
        return hand;
    }

    findFlush(cutCard) {
        var suits = new Set(this.cards.map(x => x.slice(-1)));
        var hasOneSuit = x => x.size == 1;
        var flushInHand = hasOneSuit(suits);
        var suitOfCutCard = cutCard.slice(-1);
        var flushWithCutCard = flushInHand && hasOneSuit(suits.add(suitOfCutCard));

        var flush = flushWithCutCard && this._includeCutCardWithHand(cutCard)
                || flushInHand && this.cards
                || [];

        return flush;
    }

    _completeAndSortHand(cutCard) {
        var hand = this._includeCutCardWithHand(cutCard);
        hand = hand.toSorted(cardCompare);
        return hand;
    }

    _groupHandAndCutCardByFaceValue(cutCard) {
        var hand = this._completeAndSortHand(cutCard);
        var cardsMatch = (a, card) => cardCompare(a.at(-1).at(-1), card) == 0;
        var appendToMultiple = (a, card) => a.slice(0,-1).concat([a.at(-1).concat([card])]);
        var addCardToExisting = (a, card) => cardsMatch(a, card) && appendToMultiple(a, card);
        var addCardToMultiple = (a, card) => addCardToExisting(a, card) || a.concat([[card]]);
        var multiples = hand.reduce(addCardToMultiple, [[]]);
        multiples = multiples.slice(1);
        return multiples;
    }

    findMultiples(cutCard) {
        var multiples = this._groupHandAndCutCardByFaceValue(cutCard);
        multiples = multiples.filter(x => x.length > 1);
        return multiples;
    }

    findRuns(cutCard) {
        var hand = this._groupHandAndCutCardByFaceValue(cutCard);

        var collateRuns = (runs, card) => {
            var addedToRun = false;
            var cardFollowsRun = r => r.slice(-1).every(x => 1 + fv(x) == fv(card[0]));
            var addToRun = (c, r) => {addedToRun = true; return c.map(x => r.concat(x));};
            runs = runs.flatMap(r => cardFollowsRun(r) && addToRun(card, r) || [r]);
            runs = addedToRun && runs || runs.concat(addToRun(card, []));
            return runs;
        }
        var runs = hand.reduce(collateRuns, [[]]);
        runs = runs.filter(r => r.length > 2);
        return runs;
    }

    findFifteens(cutCard) {
        var hand = this._completeAndSortHand(cutCard);

        var addCardToAll = (a, v) => a.concat(a.map(x => [v].concat(x)));
        var cardScore = x => Math.min(10, 1 + fv(x));
        var handTotal = a => a.reduce((x, y) => x + cardScore(y), 0);
        var cardsAddToFifteen = a => handTotal(a) == 15;
        var fifteens = hand.reduce(addCardToAll, [[]]);
        fifteens = fifteens.filter(cardsAddToFifteen);

        return fifteens;
    }

    getScore(cutCard) {
        var t = this.getTricks(cutCard);
        var score = 2 * t.fifteens.length;
        score += t.pairs.length * 2;
        score += t.triples.length * 6;
        score += t.quadruples.length * 12;
        score += t.runs.reduce((a, x) => a + x.length, 0);
        score += t.hisNobs.length == 2 && 1 || 0;
        score += t.flush.length;
        return score;
    }

    getTricks(cutCard) {
        var multiples = this.findMultiples(cutCard);
        var multipleOfLength = n => multiples.filter(x => x.length == n);

        var tricks = {
            fifteens: this.findFifteens(cutCard),
            runs: this.findRuns(cutCard),
            pairs: multipleOfLength(2),
            triples: multipleOfLength(3),
            quadruples: multipleOfLength(4),
            flush: this.findFlush(cutCard),
            hisNobs: this.findHisNobs(cutCard),
        };

        return tricks;
    }
}
