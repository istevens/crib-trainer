'use strict';

import ShuffledCardDeck from './shuffled_card_deck.js';

const JACK = 'J';
const FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', JACK, 'Q', 'K'];
const SUITS = ['C', 'D', 'S', 'H'];
const DECK = SUITS.flatMap(s => FACES.map(f => f + s));
const fv = a => !a && -1 || FACES.indexOf(a.slice(0, -1));
const cardCompare = (a, b) => fv(a) < fv(b) && -1 || fv(a) > fv(b) && 1 || 0;

const pointsPerCard = n => x => n * x.flat().length;
const ppc1 = pointsPerCard(1);
const SCORE_FNS = {
    fifteens: x => 2 * x.length,
    pairs: ppc1,
    triples: pointsPerCard(2),
    quadruples: pointsPerCard(3),
    runs: ppc1,
    flush: ppc1,
    'his nobs': pointsPerCard(0.5)
};


export default class CribbageHand {

    constructor(cards) {
        this.cards = cards;
    }

    static fromString(s) {
        const hand = s.split(' ');
        return new CribbageHand(hand);
    }

    static randomPlay(deck = new ShuffledCardDeck(DECK)) {
        const dealt = deck.draw(5); // 4 for hand + 1 cut
        return { hand: new CribbageHand(dealt.slice(0, 4)), cutCard: dealt[4] };
    }

    /**
     * Choose the best 4-card keep from a provided 6-card deal by maximizing
     * the expected score across all possible cut cards from the remaining deck.
     * Returns { hand: CribbageHand, discards: string[], expectedScore: number, six: string[] }
     */
    static seasonedFromSix(six) {
        const combinations = (arr, k) => {
            if (k === 0) return [[]];
            if (arr.length === 0) return [];
            const [first, ...rest] = arr;
            const withFirst = combinations(rest, k - 1).map(c => [first, ...c]);
            const withoutFirst = combinations(rest, k);
            return withFirst.concat(withoutFirst);
        };

        const remainingCuts = DECK.filter(c => !six.includes(c));
        const keepCandidates = combinations(six, 4);

        const evaluated = keepCandidates.map(keep => {
            const hand = new CribbageHand(keep);
            const total = remainingCuts.reduce((sum, cut) => sum + hand.getScore(cut), 0);
            const expected = total / remainingCuts.length;
            return { keep: keep.slice(), expected };
        });

        const best = evaluated.reduce((b, cur) => (!b || cur.expected > b.expected) ? cur : b, null);

        const discards = six.filter(c => !best.keep.includes(c));
        return {
            hand: new CribbageHand(best.keep),
            discards,
            expectedScore: best.expected,
            six: six.slice()
        };
    }

    static seasonedPlay(deck = new ShuffledCardDeck(DECK)) {
        const six = deck.draw(6);
        return CribbageHand.seasonedFromSix(six);
    }

    findHisNobs(cutCard) {
        const cutSuit = cutCard.at(-1);
        const jackOfCutSuit = JACK + cutSuit;
        const jackOfCutSuitIsInHand = this.cards.includes(jackOfCutSuit);
        return jackOfCutSuitIsInHand ? [cutCard, jackOfCutSuit] : [];
    }

    _includeCutCardWithHand(cutCard) {
        return [...this.cards, cutCard];
    }

    findFlush(cutCard) {
        const suits = new Set(this.cards.map(c => c.slice(-1)));
        if (suits.size !== 1) return [];
        const [handSuit] = [...suits];
        const cutSuit = cutCard.slice(-1);
        return cutSuit === handSuit ? this._includeCutCardWithHand(cutCard) : this.cards;
    }

    _completeAndSortHand(cutCard) {
        const hand = this._includeCutCardWithHand(cutCard);
        return hand.toSorted(cardCompare);
    }

    _groupHandAndCutCardByFaceValue(cutCard) {
        const hand = this._completeAndSortHand(cutCard);
        const cardsMatch = (a, card) => cardCompare(a.at(-1).at(-1), card) == 0;
        const appendToMultiple = (a, card) => a.slice(0, -1).concat([a.at(-1).concat([card])]);
        const addCardToExisting = (a, card) => cardsMatch(a, card) && appendToMultiple(a, card);
        const addCardToMultiple = (a, card) => addCardToExisting(a, card) || a.concat([[card]]);
        const multiples = hand.reduce(addCardToMultiple, [[]]).slice(1);
        return multiples;
    }

    findMultiples(cutCard) {
        return this._groupHandAndCutCardByFaceValue(cutCard).filter(x => x.length > 1);
    }

    findRuns(cutCard) {
        const hand = this._groupHandAndCutCardByFaceValue(cutCard);
        const collateRuns = (runs, card) => {
            let addedToRun = false;
            const cardFollowsRun = r => r.slice(-1).every(x => 1 + fv(x) == fv(card[0]));
            const addToRun = (c, r) => { addedToRun = true; return c.map(x => r.concat(x)); };
            let next = runs.flatMap(r => cardFollowsRun(r) && addToRun(card, r) || [r]);
            next = addedToRun ? next : next.concat(addToRun(card, []));
            return next;
        };
        return hand.reduce(collateRuns, [[]]).filter(r => r.length > 2);
    }

    findFifteens(cutCard) {
        const hand = this._completeAndSortHand(cutCard);
        const addCardToAll = (a, v) => a.concat(a.map(x => [v].concat(x)));
        const cardScore = x => Math.min(10, 1 + fv(x));
        const handTotal = a => a.reduce((x, y) => x + cardScore(y), 0);
        const cardsAddToFifteen = a => handTotal(a) == 15;
        return hand.reduce(addCardToAll, [[]]).filter(cardsAddToFifteen);
    }

    getScore(cutCard) {
        const t = this.getTricks(cutCard);
        return Object.values(t).reduce((x, y) => x + y.score, 0);
    }

    getTricks(cutCard) {
        const multiples = this.findMultiples(cutCard);
        const multipleOfLength = n => multiples.filter(x => x.length == n);
        const arrayIfNotEmpty = x => x.length > 1 && [x] || x;

        const tricks = {
            fifteens: this.findFifteens(cutCard),
            pairs: multipleOfLength(2),
            triples: multipleOfLength(3),
            quadruples: multipleOfLength(4),
            runs: this.findRuns(cutCard),
            flush: arrayIfNotEmpty(this.findFlush(cutCard)),
            'his nobs': arrayIfNotEmpty(this.findHisNobs(cutCard)),
        };

        const tricksAndScores = Object.entries(tricks)
            .filter(x => x[1].length > 0)
            .map(x => [x[0], { data: x[1], score: SCORE_FNS[x[0]](x[1]) }]);

        return Object.fromEntries(tricksAndScores);
    }
}
