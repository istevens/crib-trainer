import * as Constants from "../constants.js";

export default class ScoreSelect extends HTMLElement {
    static STYLE = `
        :host {
            --svgTrianglesInactive: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -8 8 16"><polygon points="8,-1 4.5,-8 1,-1" fill="black"/><polygon points="4.5,8 1,1 8,1" fill="black"/></svg>');
            --svgTrianglesActive: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -8 8 16"><polygon points="8,-1 4.5,-8 1,-1" fill="rgba(255, 255, 130, 0.5)"/><polygon points="4.5,8 1,1 8,1" fill="rgba(255, 255, 130, 0.5)"/></svg>');
            cursor: pointer;
            box-sizing: border-box;
            color: black;
            background-color: var(--tableDecorColour);
            border: var(--uiElementBorder);
        }

        select {
            appearance: none;
            border: none;
            outline: none;
            color: inherit;
            font-family: inherit;
            font-size: inherit;
            padding: var(--interItemPadding);
            padding-right: 1.5em !important;
            background-color: transparent;
            background-image: var(--svgTrianglesInactive);
            background-repeat: no-repeat;
            background-position: right 0.5em center;
            background-size: 0.5em;
            height: 100%;
            width: 100%;
            text-wrap: wrap;
        }

        select:focus {
            outline: none;
        }

        @media (hover: hover) {
            :host(:hover) {
                color: var(--tableDecorColour);
                background-color: transparent;
            }
            :host(:hover) select {
                background-image: var(--svgTrianglesActive);
            }
        }

        @media (hover: none) {
            :host(:focus) {
                color: var(--tableDecorColour);
                background-color: transparent;
            }

            :host(:focus) select {
                background-image: var(--svgTrianglesActive);
            }
        }
    `;

    static observedAttributes = ['autofocus', 'min', 'max'];

    constructor() {
        super();

        let style = new CSSStyleSheet();
        style.replaceSync(ScoreSelect.STYLE);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        let _se = this.selectElement = document.createElement('select');
        let o = document.createElement('option');
        o.disabled = o.selected = true;
        o.textContent = "This hand's score is:";
        _se.appendChild(o);
        this.shadowRoot.appendChild(_se);

        const _ga = x => parseInt(this.getAttribute(x) || 0);
        this.generateScores(_ga('min'), _ga('max'));

        document.addEventListener(Constants.NEW_ROUND, this);
        this.addEventListener('focus', () => _se.focus());
        _se.addEventListener('change', e => {
            e = new Event('change', {bubbles: true, composed: true});
            this.dispatchEvent(e);
        });
    }

    get value() {
        return this.selectElement.value;
    }

    attributeChangedCallback(name, oldVal, newVal) {
        const shouldChangeAutofocus = name == 'autofocus';
        shouldChangeAutofocus && setTimeout(() => {
            this.selectElement.autofocus = newVal;
            newVal && this.selectElement.focus();
        }, 0);
    }

    get hasAutoFocus() {
        return this.getAttribute('autofocus') && true || false;
    }

    generateScores(min, max) {
        if(min > max) return;

        for(let score = min; score <= max; score++) {
            const option = document.createElement('option');
            option.value = score;
            option.textContent = score;
            this.selectElement.appendChild(option);
        }
    }

    handleEvent(e) {
        const _e = this.selectElement;
        _e.selectedIndex = 0;
        const f = 'ontouchstart' in window && (() => _e.blur()) || (() => _e.focus());
        f();
    }
}

customElements.define('score-select', ScoreSelect);
