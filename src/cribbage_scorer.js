'use strict';

const JACK = 'J';
const FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', JACK, 'Q', 'K'];
const SUITS = ['C', 'D', 'S', 'H'];
const DECK = SUITS.flatMap(s => FACES.map(f => f+s));
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

    static randomPlay() {
        function* dealCards(d) {
            const drawRandomCard = () => {
                const n = Math.random() * d.length;
                const card = d.at(n);
                d = d.toSpliced(n, 1);
                return card;
            }

            while(d.length > 0) {
                yield drawRandomCard();
            }
        }

        const cards = dealCards(DECK);
        const hand = new Array(4).fill().map(() => cards.next().value);
        const handObj = new CribbageHand(hand);
        const cutCard = cards.next().value;

        return {hand: handObj, cutCard: cutCard};
    }

    findHisNobs(cutCard) {
        const cutSuit = cutCard.at(-1);
        const jackOfCutSuit = JACK + cutSuit;
        const jackOfCutSuitIsInHand = this.cards.includes(jackOfCutSuit);
        const hisNobs = jackOfCutSuitIsInHand && [cutCard, jackOfCutSuit] || [];
        return hisNobs;
    }

    _includeCutCardWithHand(cutCard) {
        let hand = this.cards.slice();
        hand = hand.concat(cutCard);
        return hand;
    }

    findFlush(cutCard) {
        let suits = new Set(this.cards.map(x => x.slice(-1)));
        let hasOneSuit = x => x.size == 1;
        let flushInHand = hasOneSuit(suits);
        let suitOfCutCard = cutCard.slice(-1);
        let flushWithCutCard = flushInHand && hasOneSuit(suits.add(suitOfCutCard));

        let flush = flushWithCutCard && this._includeCutCardWithHand(cutCard)
                || flushInHand && this.cards
                || [];

        return flush;
    }

    _completeAndSortHand(cutCard) {
        let hand = this._includeCutCardWithHand(cutCard);
        hand = hand.toSorted(cardCompare);
        return hand;
    }

    _groupHandAndCutCardByFaceValue(cutCard) {
        const hand = this._completeAndSortHand(cutCard);
        const cardsMatch = (a, card) => cardCompare(a.at(-1).at(-1), card) == 0;
        const appendToMultiple = (a, card) => a.slice(0,-1).concat([a.at(-1).concat([card])]);
        const addCardToExisting = (a, card) => cardsMatch(a, card) && appendToMultiple(a, card);
        const addCardToMultiple = (a, card) => addCardToExisting(a, card) || a.concat([[card]]);
        let multiples = hand.reduce(addCardToMultiple, [[]]);
        multiples = multiples.slice(1);
        return multiples;
    }

    findMultiples(cutCard) {
        let multiples = this._groupHandAndCutCardByFaceValue(cutCard);
        multiples = multiples.filter(x => x.length > 1);
        return multiples;
    }

    findRuns(cutCard) {
        const hand = this._groupHandAndCutCardByFaceValue(cutCard);

        const collateRuns = (runs, card) => {
            let addedToRun = false;
            const cardFollowsRun = r => r.slice(-1).every(x => 1 + fv(x) == fv(card[0]));
            const addToRun = (c, r) => {addedToRun = true; return c.map(x => r.concat(x));};
            let next = runs.flatMap(r => cardFollowsRun(r) && addToRun(card, r) || [r]);
            next = addedToRun && next || next.concat(addToRun(card, []));
            return next;
        }
        let runs = hand.reduce(collateRuns, [[]]);
        runs = runs.filter(r => r.length > 2);
        return runs;
    }

    findFifteens(cutCard) {
        const hand = this._completeAndSortHand(cutCard);

        const addCardToAll = (a, v) => a.concat(a.map(x => [v].concat(x)));
        const cardScore = x => Math.min(10, 1 + fv(x));
        const handTotal = a => a.reduce((x, y) => x + cardScore(y), 0);
        const cardsAddToFifteen = a => handTotal(a) == 15;
        let fifteens = hand.reduce(addCardToAll, [[]]);
        fifteens = fifteens.filter(cardsAddToFifteen);

        return fifteens;
    }

    getScore(cutCard) {
        const t = this.getTricks(cutCard);
        const score = Object.values(t).reduce((x,y) => x + y.score, 0);
        return score;
    }

    getTricks(cutCard) {
        let multiples = this.findMultiples(cutCard);
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

        let tricksAndScores = Object.entries(tricks).filter(x => x[1].length > 0);
        tricksAndScores = tricksAndScores.map(x => {
            const tricks = [x[0], {data: x[1], score: SCORE_FNS[x[0]](x[1])}];
            return tricks;
        });

        tricksAndScores = Object.fromEntries(tricksAndScores);
        return tricksAndScores;
    }
}
