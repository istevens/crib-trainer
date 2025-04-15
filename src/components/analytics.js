import * as Constants from "../constants.js";
import defineComponent from "./simple_template.js";

export default defineComponent(
    'analytics-tracking',
    '',
    '',
    function(ev) {
        function processQueueAndEnableDirectTracking(e) {
            this._gtagReady = true;
            this._eventQueue.forEach(e => trackEvent(e.name, e.params));
            this._eventQueue = [];
        }

        if(!this._initialized) {
            this._initialized = true;
            this._eventQueue = [];
            const gid = this.getAttribute('gid');

            const scriptGA = document.createElement('script');
            scriptGA.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
            scriptGA.async = true;
            scriptGA.onload = () => setTimeout(processQueueAndEnableDirectTracking.bind(this), 100);
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

        function trackEvent(eventName, params) {
            this._gtagReady
                ? window.gtag('event', eventName, params)
                : this._eventQueue.push({ name: eventName, params });
        }
        trackEvent = trackEvent.bind(this);

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
            [Constants.SCORE_SELECTED]: e => {
                const { selectedScore, expectedScore, scoresMatch } = e.detail;
                trackEvent('hand_scored', {
                    event_category: 'Game',
                    event_label: scoresMatch ? 'Correct Score' : 'Incorrect Score',
                });
            },

            [Constants.NEW_ROUND]: e => {
                trackEvent('round_started', {
                    event_category: 'Game',
                    event_label: 'New Round',
                });
            },

            [Constants.HASH_CHANGE]: e => {
                const getSection = u => u && u.indexOf('#') > 0 && u.split('#')[1] || 'start';
                trackEvent('section_switched', {
                    event_category: 'Navigation',
                    event_label: getSection(e.newURL),
                    from_url: getSection(e.oldURL),
                });
            },

            [Constants.DIALOG_OPEN]: dialogHandler,
            [Constants.DIALOG_CLOSE]: dialogHandler
        };

        let h = handlers[ev.type];
        h?.(ev);
    }
);
