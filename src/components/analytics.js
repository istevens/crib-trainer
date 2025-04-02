import defineComponent from "./simple_template.js";

defineComponent(
    'analytics-tracking',
    '',
    '',
    function(ev) {
        // @TODO: Move event constants to shared spot
        const SCORE_SELECTED = "scoreSelected";
        const NEW_ROUND = "newRound";
        const HASH_CHANGE = "hashchange";
        const DIALOG_OPEN = "open";
        const DIALOG_CLOSE = "close";

        const dialogHandler = e => {
            let dialogName = e.srcElement.id;
            e = e.type;
            e = e.at(-1) != 'e' && e + 'e' || e;
            gtag('event', `dialog_${e}d`, {
                event_category: 'Dialogs',
                event_label: dialogName
            });
        }

        const handlers = {
            [SCORE_SELECTED]: e => {
                const { selectedScore, expectedScore, scoresMatch } = e.detail;
                gtag('event', 'hand_scored', {
                    event_category: 'Game',
                    event_label: scoresMatch ? 'Correct Score' : 'Incorrect Score',
                });
            },

            [NEW_ROUND]: e => {
                gtag('event', 'round_started', {
                    event_category: 'Game',
                    event_label: 'New Round',
                });
            },

            [HASH_CHANGE]: e => {
                const getSection = u => u && u.indexOf('#') > 0 && u.split('#')[1] || 'start';
                gtag('event', 'section_switched', {
                    event_category: 'Navigation',
                    event_label: getSection(e.newURL),
                    from_url: getSection(e.oldURL),
                });
            },

            [DIALOG_OPEN]: dialogHandler,
            [DIALOG_CLOSE]: dialogHandler

        };

        let h = handlers[ev.type];
        h?.(ev);
    }
);
