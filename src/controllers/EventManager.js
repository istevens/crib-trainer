import * as Constants from "../constants.js";

// @TODO remove helper _getEL when components wired up properly
const _getEl = x => document.getElementById(x);

export default class EventManager {
    constructor(app) {
        this.app = app;
    }

    initialize() {
        this.addEventListeners();
        this.addAnalyticsListeners();
    }

    addEventListeners() {
        const root = this.app.root;
        var scoreOverlay = _getEl('selectedScore');
        var selector = _getEl('scoreSelect');
        var app = this.app;

        root.addEventListener(Constants.SCORE_SELECTED, _getEl('scoreboard'));
        root.addEventListener(Constants.SCORE_SELECTED, scoreOverlay);
        root.addEventListener(Constants.NEW_ROUND, _getEl('cards'));
        root.addEventListener(Constants.NEW_ROUND, selector);
        root.addEventListener('change', e => app.handWasScored(e));
        scoreOverlay.addEventListener('transitionend', () => app.finishRound());
        window.addEventListener(Constants.HASH_CHANGE, () => app.uiController.switchSections());
        _getEl('tricks').addEventListener(Constants.DIALOG_CLOSE, () => app.startNewRound());

        var dialogButtons = root.querySelectorAll("[command=show-modal]");
        Array.from(dialogButtons, b => b.addEventListener('click', () => app.uiController.openDialog(b.getAttribute('commandfor'))));

        // Prevent double-tap to zoom and long-press
        root.addEventListener('dblclick', e => e.preventDefault());
        root.addEventListener('contextmenu', e => e.preventDefault());
    }

    addAnalyticsListeners() {
        const root = this.app.root;
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
}
