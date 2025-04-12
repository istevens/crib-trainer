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

        // Set up a temporary queue for events until gtag is loaded.
        // These scripts would be in the template but scripts
        // added via innerHTML are not executed.
        if(!this._initialized) {
            this._initialized = true;
            this._eventQueue = [];
            const gid = this.getAttribute('gid');

            const scriptGA = document.createElement('script');
            scriptGA.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
            scriptGA.async = true;
            scriptGA.onload = () => setTimeout(processQueueAndEnableDirectTracking, 100);
            this.shadowRoot.appendChild(scriptGA);

            const scriptInit = document.createElement('script');
            scriptInit.textContent = `
                window.dataLayer = window.dataLayer || [];
                window.gtag = function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gid}');
            `;
            this.shadowRoot.appendChild(scriptInit);
        }

        const trackEvent = (eventName, params) =>
            this._gtagReady
                ? window.gtag('event', eventName, params)
                : this._eventQueue.push({ name: eventName, params });

        const dialogHandler = e => {
            let dialogName = e.srcElement.id;
            e = e.type;
            e = e.at(-1) != 'e' && e + 'e' || e;
            trackEvent(`dialog_${e}d`, {
                event_category: 'Dialogs',
                event_label: dialogName
            });
        }

        const handlers = {
            [SCORE_SELECTED]: e => {
                const { selectedScore, expectedScore, scoresMatch } = e.detail;
                trackEvent('hand_scored', {
                    event_category: 'Game',
                    event_label: scoresMatch ? 'Correct Score' : 'Incorrect Score',
                });
            },

            [NEW_ROUND]: e => {
                trackEvent('round_started', {
                    event_category: 'Game',
                    event_label: 'New Round',
                });
            },

            [HASH_CHANGE]: e => {
                const getSection = u => u && u.indexOf('#') > 0 && u.split('#')[1] || 'start';
                trackEvent('section_switched', {
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
