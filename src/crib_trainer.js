document.addEventListener('DOMContentLoaded', () => {
    import('./cribbagescorer.js').then(module => {
        const CribbageHand = module.default;

        const _getEl = x => document.getElementById(x);
        const isTouch = 'ontouchstart' in window;

        var play = null;
        const SCORE_SELECTED = "scoreSelected";
        const NEW_ROUND = "newRound";

        function startNewRound() {
            play = CribbageHand.randomPlay();
            //play = {cutCard: '5S', hand: CribbageHand.fromString('5C 5D 5H JS')};

            const trainer = _getEl('cribtrainer');
            var evPayload = {bubbles: true, detail: {play: play}};
            trainer.dispatchEvent(new CustomEvent(NEW_ROUND, evPayload));
        }

        function finishRound() {
            const trainer = _getEl('cribtrainer');
            let expectedScore = play.hand.getScore(play.cutCard);
            let scoresMatch = _getEl('scoreSelect').value == expectedScore;
            let next = scoresMatch && startNewRound
                || (() => showTricks.bind(trainer).call(trainer, play, expectedScore));
            next();
        }

        function handWasScored(ev) {
            var selected = this.value;
            var expected = play.hand.getScore(play.cutCard);
            var evPayload = {bubbles: true, detail: {
                    play: play,
                    selectedScore: selected,
                    expectedScore: expected,
                    scoresMatch: selected == expected
            }};

            this.dispatchEvent(new CustomEvent(SCORE_SELECTED, evPayload));
        }

        function openDialog(d) {
            d = document.querySelector('[role=dialog]#' + d);
            d.showModal();
        }

        function showTricks(play, expectedScore) {
            const dialog = document.getElementById('tricks');
            dialog.showModal(play, expectedScore);
        }

        function switchSections() {
            const trainer = _getEl('cribtrainer');
            var location = window.location.hash.replace('#', '');
            location = location || 'start';
            var sections = ['.activeContent', '#' + location];
            sections.map(x => {
                trainer.querySelector(x)?.classList.toggle('activeContent');
            });
            location == 'play' && startNewRound();
        };

        function addEventListeners() {
            var trainer = _getEl('cribtrainer');
            var scoreOverlay = _getEl('selectedScore');
            var selector = _getEl('scoreSelect');

            trainer.addEventListener(SCORE_SELECTED, _getEl('scoreboard'));
            trainer.addEventListener(SCORE_SELECTED, scoreOverlay);
            trainer.addEventListener(NEW_ROUND, _getEl('cards'));
            trainer.addEventListener(NEW_ROUND, selector);
            selector.addEventListener('change', handWasScored);
            scoreOverlay.addEventListener('transitionend', finishRound);
            window.addEventListener('hashchange', switchSections);
            _getEl('tricks').addEventListener("close", startNewRound);

            var dialogButtons = trainer.querySelectorAll("[command=show-modal]");
            Array.from(dialogButtons, b => b.addEventListener('click', () => openDialog(b.getAttribute('commandfor'))));

            // Prevent double-tap to zoom and long-press
            document.addEventListener('dblclick', e => e.preventDefault());
            document.addEventListener('contextmenu', e => e.preventDefault());
        }

        function addAnalyticsListeners() {
            const trainer = document.getElementById('cribtrainer');
            const analytics = document.getElementsByTagName('analytics-tracking')[0];

            trainer.addEventListener(SCORE_SELECTED, analytics);
            trainer.addEventListener(NEW_ROUND, analytics);
            window.addEventListener('hashchange', analytics);

            const dialogs = document.querySelectorAll('[role=dialog]');
            const events = ['open', 'close'];
            dialogs.forEach(d => {
                const dialogName = d.id.replace('Dialog', '').toLowerCase();
                events.forEach(e => d.addEventListener(e, analytics));
            });
        }

        function setup() {
            addEventListeners();
            addAnalyticsListeners();
            switchSections();
        }

        setup();
    });
});
