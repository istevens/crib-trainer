document.addEventListener('DOMContentLoaded', () => {
    import('./cribbage_scorer.js').then(module => {
        const CribbageHand = module.default;
        const app = new CribbageApp(CribbageHand);
        app.initialize();
    });
});

import * as Constants from "./constants.js";
import EventManager from "./controllers/EventManager.js";
import UIController from "./controllers/UIController.js";

const _getEl = x => document.getElementById(x);

class CribbageApp {

    constructor(CribbageHand) {
        this.CribbageHand = CribbageHand;
        this.play = null;
        this.root = _getEl('cribtrainer');
        this.eventManager = new EventManager(this);
        this.uiController = new UIController(this);
    }

    startNewRound() {
        this.play = this.CribbageHand.randomPlay();
//        this.play = {cutCard: '5S', hand: this.CribbageHand.fromString('5C 5D 5H JS')};

        var evPayload = {bubbles: true, detail: {play: this.play}};
        this.root.dispatchEvent(new CustomEvent(Constants.NEW_ROUND, evPayload));
    }

    finishRound() {
        let expectedScore = this.play.hand.getScore(this.play.cutCard);
        let scoresMatch = _getEl('scoreSelect').value == expectedScore;
        let next = scoresMatch && (() => this.startNewRound()) || (() => this.uiController.showTricks(expectedScore));
        next();
    }

    handWasScored(ev) {
        var selected = ev.target.value;
        var expected = this.play.hand.getScore(this.play.cutCard);
        var evPayload = {bubbles: true, detail: {
                play: this.play,
                selectedScore: selected,
                expectedScore: expected,
                scoresMatch: selected == expected
        }};

        this.root.dispatchEvent(new CustomEvent(Constants.SCORE_SELECTED, evPayload));
    }

    initialize() {
        this.eventManager.initialize();
        this.uiController.switchSections();
    }
}
