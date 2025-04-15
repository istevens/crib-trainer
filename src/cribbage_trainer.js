document.addEventListener('DOMContentLoaded', () => {
    import('./cribbage_scorer.js').then(module => {
        const CribbageHand = module.default;
        const app = new CribbageApp(CribbageHand);
        app.initialize();
    });
});

import * as Constants from "./constants.js";

const _getEl = x => document.getElementById(x);

class CribbageApp {

    constructor(CribbageHand) {
        this.CribbageHand = CribbageHand;
        this.play = null;
        this.root = _getEl('cribtrainer');
    }

    startNewRound() {
        this.play = this.CribbageHand.randomPlay();
        //this.play = {cutCard: '5S', hand: CribbageHand.fromString('5C 5D 5H JS')};

        var evPayload = {bubbles: true, detail: {play: this.play}};
        this.root.dispatchEvent(new CustomEvent(Constants.NEW_ROUND, evPayload));
    }

    finishRound() {
        let expectedScore = this.play.hand.getScore(this.play.cutCard);
        let scoresMatch = _getEl('scoreSelect').value == expectedScore;
        let next = scoresMatch && (() => this.startNewRound()) || (() => this.showTricks(expectedScore));
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

    openDialog(d) {
        d = document.querySelector('[role=dialog]#' + d);
        d.showModal();
    }

    showTricks(expectedScore) {
        const dialog = document.getElementById('tricks');
        dialog.showModal(this.play, expectedScore);
    }

    switchSections() {
        var location = window.location.hash.replace('#', '');
        location = location || 'start';
        var sections = ['.activeContent', '#' + location];
        sections.map(x => {
            this.root.querySelector(x)?.classList.toggle('activeContent');
        });
        location == 'play' && this.startNewRound();
    };

    addEventListeners() {
        const root = this.root;
        var scoreOverlay = _getEl('selectedScore');
        var selector = _getEl('scoreSelect');

        root.addEventListener(Constants.SCORE_SELECTED, _getEl('scoreboard'));
        root.addEventListener(Constants.SCORE_SELECTED, scoreOverlay);
        root.addEventListener(Constants.NEW_ROUND, _getEl('cards'));
        root.addEventListener(Constants.NEW_ROUND, selector);
        root.addEventListener('change', e => this.handWasScored(e));
        scoreOverlay.addEventListener('transitionend', () => this.finishRound());
        window.addEventListener(Constants.HASH_CHANGE, () => this.switchSections());
        _getEl('tricks').addEventListener(Constants.DIALOG_CLOSE, () => this.startNewRound());

        var dialogButtons = root.querySelectorAll("[command=show-modal]");
        Array.from(dialogButtons, b => b.addEventListener('click', () => this.openDialog(b.getAttribute('commandfor'))));

        // Prevent double-tap to zoom and long-press
        root.addEventListener('dblclick', e => e.preventDefault());
        root.addEventListener('contextmenu', e => e.preventDefault());
    }

    addAnalyticsListeners() {
        const root = this.root;
        const analytics = root.getElementsByTagName('analytics-tracking')[0];

        root.addEventListener(Constants.SCORE_SELECTED, analytics);
        root.addEventListener(Constants.NEW_ROUND, analytics);
        window.addEventListener(Constants.HASH_CHANGE, analytics);

        const dialogs = document.querySelectorAll('[role=dialog]');
        const events = [Constants.DIALOG_OPEN, Constants.DIALOG_CLOSE];
        dialogs.forEach(d => {
            const dialogName = d.id.replace('Dialog', '').toLowerCase();
            events.forEach(e => d.addEventListener(e, analytics));
        });
    }

    initialize() {
        this.addEventListeners();
        this.addAnalyticsListeners();
        this.switchSections();
    }
}
