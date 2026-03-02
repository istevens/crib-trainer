'use strict';
let pkg;
import('/package.json')
    .then(module => (pkg = module))
    .catch(module => (pkg = {})); // @TODO a controller for package.json access
import * as Constants from "../constants.js";

export default class AnalyticsComponent extends HTMLElement {
    static STYLE = ':host { visibility: hidden; }';

    constructor() {
        super();
        let style = new CSSStyleSheet();
        style.replaceSync(AnalyticsComponent.STYLE);
        this.attachShadow({mode: "open"});
        this.shadowRoot.adoptedStyleSheets = [style];
        this._gtagReady = false;
        this._eventQueue = [];
    }

    connectedCallback() {
        const _processQueueAndEnableDirectTracking = e => {
            this._gtagReady = true;
            this._eventQueue.forEach(e => this.trackEvent(e.name, e.params));
            this._eventQueue = [];
        }
        _processQueueAndEnableDirectTracking.bind(this);

        const gid = this.getAttribute('gid');

        const scriptGA = document.createElement('script');
        scriptGA.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
        scriptGA.async = true;
        scriptGA.onload = () => setTimeout(_processQueueAndEnableDirectTracking, 100);
        this.shadowRoot.appendChild(scriptGA);

        const scriptInit = document.createElement('script');
        scriptInit.textContent = `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gid}');
        `;
        this.shadowRoot.appendChild(scriptInit);

        document.addEventListener(Constants.SCORE_SELECTED, this);
        document.addEventListener(Constants.NEW_ROUND, this);
        document.addEventListener(Constants.VIEW_SWITCHED, this);

        const dialogs = document.querySelectorAll('[role=dialog]');
        const events = [Constants.DIALOG_OPEN, Constants.DIALOG_CLOSE];
        dialogs.forEach(d => {
            const dialogName = d.id.replace('Dialog', '').toLowerCase();
            events.forEach(e => d.addEventListener(e, this));
        });
    }

    trackEvent(eventName, params) {
        this._gtagReady
            ? window.gtag('event', eventName, params)
            : this._eventQueue.push({ name: eventName, params });
    }

    dialogHandler(e) {
        let dialogName = e.srcElement.id;
        e = e.type;
        e = e.at(-1) != 'e' && e + 'e' || e;
        this.trackEvent(`dialog_${e}d`, {
            event_category: 'engagement',
            event_label: dialogName
        });
    }

    handleEvent(ev) {
        const _dialogHandler = this.dialogHandler.bind(this);

        const handlers = {
            [Constants.SCORE_SELECTED]: e => {
                const { selectedScore, expectedScore, scoresMatch } = e.detail;
                this.trackEvent('hand_scored', {
                    event_category: 'Game',
                    event_label: scoresMatch ? 'Correct Score' : 'Incorrect Score',
                    score_value: scoresMatch ? 1 : -1
                });
            },

            [Constants.NEW_ROUND]: e => {
                this.trackEvent('round_started', {
                    event_category: 'Game',
                    event_label: 'New Round',
                });
            },

            [Constants.VIEW_SWITCHED]: e => {
                this.trackEvent('screen_view', {
                    event_category: 'Navigation',
                    app_name: `${pkg.name}`,
                    page_name: e.detail.view,
                    screen_name: e.detail.view
                });
            },

            [Constants.DIALOG_OPEN]: _dialogHandler,
            [Constants.DIALOG_CLOSE]: _dialogHandler
        };

        let h = handlers[ev.type];
        h?.(ev);
    }
}
customElements.define("analytics-tracking", AnalyticsComponent);
