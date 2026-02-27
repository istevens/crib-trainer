import * as Constants from "../constants.js";

// @TODO remove helper _getEL when components wired up properly
const _getEl = x => document.getElementById(x);

export default class EventManager {
    constructor(app) {
        this.app = app;
    }

    initialize() {
        this.addEventListeners();
    }

    addEventListeners() {
        const root = this.app.root;
        var scoreOverlay = _getEl('selectedScore');
        var app = this.app;

        root.addEventListener('change', e => app.handWasScored(e));
        scoreOverlay.addEventListener('transitionend', () => app.finishRound());
        document.addEventListener(Constants.VIEW_SWITCHED, e => {
            e.detail.view === 'play' && app.startNewRound();
        });
        _getEl('tricks').addEventListener(Constants.DIALOG_CLOSE, () => app.startNewRound());

        // Prevent double-tap to zoom, invocation of context menu
        // @TODO Determine why double-tap still occurs with precise double-tap
        var preventDoubleTap = e1 => {
            const checkForDoubleTap = e2 => {
                const timeSinceTouchEnd = e2.timeStamp - e1.timeStamp;
                const isDoubleTap = e1.target == e2.target && timeSinceTouchEnd <= 300;
                isDoubleTap && e2.preventDefault();
            }
            e1.target.addEventListener('touchstart', checkForDoubleTap, {once: true, passive: false});
        }
        root.addEventListener('touchend', preventDoubleTap, {passive: false});
        root.addEventListener('contextmenu', e => e.preventDefault());
    }
}
