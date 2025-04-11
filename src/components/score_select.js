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

        :host(:focus) {
            color: var(--tableDecorColour);
            background-color: transparent;
        }

        :host(:focus) select {
            background-image: var(--svgTrianglesActive);
        }

        select {
            appearance: none;
            padding: var(--interItemPadding);
            font-family: inherit;
            font-size: inherit;
            background-color: transparent;
            background-image: var(--svgTrianglesInactive);
            background-repeat: no-repeat;
            background-position: right 0.5em center;
            background-size: 0.5em;
            padding-right: 1.5em !important;
            border: none;
            outline: none;
            color: inherit;
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

    `;

    constructor() {
        super();

        let style = new CSSStyleSheet();
        style.replaceSync(ScoreSelect.STYLE);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.adoptedStyleSheets = [style];

        let _se = this.selectElement = document.createElement('select');
        this.shadowRoot.appendChild(_se);
        _se.addEventListener('change', e => {
            e = new Event('change', {bubbles: true, composed: true});
            this.dispatchEvent(e);
        });
    }

    get value() {
        return this.selectElement.value;
    }

    connectedCallback() {
        const addDefaultOption = () => {
            const o = document.createElement('option');
            o.disabled = true;
            o.selected = true;
            o.textContent = "This hand's score is:";
            this.selectElement.appendChild(o);
        }
        const hasNoOptions = this.selectElement.options.length === 0;
        hasNoOptions && addDefaultOption();

        const _ga = x => parseInt(this.getAttribute(x) || 0);
        this.generateScores(_ga('min'), _ga('max'));
    }

    generateScores(min, max) {
        while (this.selectElement.options.length > 1) {
            this.remove(1);
        }

        // Generate options from min to max
        for (let score = min; score <= max; score++) {
            const option = document.createElement('option');
            option.value = score;
            option.textContent = score;
            this.selectElement.appendChild(option);
        }
    }

    handleEvent(e) {
        const _e = this.selectElement;
        _e.selectedIndex = 0;
        this.blur();
        'ontouchstart' in window && _e.blur();
    }
}

customElements.define('score-select', ScoreSelect, { extends: 'select' });
