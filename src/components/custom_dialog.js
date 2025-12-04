import * as Constants from '../constants.js';

export default class CustomDialogComponent extends HTMLElement {
    static observedAttributes = ['title'];

    static STYLE = `
        :host {
            --dialogColour: hsl(43, 100%, 92%);
            --dialogDecorColour: hsl(from var(--dialogColour) h s calc(l * 0.1));
            display: none;
        }

        :host([open]) {
            display: block !important;
        }

        dialog {
            padding: var(--outerPadding);
            background: fixed radial-gradient(circle at 50% 10rem, var(--dialogColour) 0%, hsl(from var(--dialogColour) h s calc(l * 0.75)) 85%, var(--dialogDecorColour) 98%);
            border: inherit;
            border-radius: inherit;
            border: 1px solid black;
            min-width: min(90vw, 30rem);
            max-width: min(90vw, var(--maxTitleWidth));
            max-height: 90vh;
            width: fit-content;
            touch-action: inherit;
            color: var(--dialogDecorColour);
            overflow: hidden;
        }

        header {
            position: relative;
            width: 100%;
        }

        header::after {
            position: absolute;
            display: block;
            width: 33%;
            bottom: calc(-0.5em * var(--interItemPadding));
            left: 33%;
            content: '';
            border-width: 1px 0 0 0;
            border-image: radial-gradient(circle, var(--dialogDecorColour), 75%, rgba(0,0,0,0)) 1 0;
            border-style: solid;
        }

        .dialog-title {
            font-size: 1.5rem;
            font-weight: 700;
            text-align: center;
            margin: 0;
            text-transform: uppercase;
        }

        [command=close] {
            border: none;
            outline: none;
            position: absolute;
            z-index: 1;
            padding: 0;
            right: 0.25rem;
            top: -0.25rem;
            background: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: inherit;
        }

        .dialog-content {
            margin-top: calc(2*var(--interItemPadding));
        }

        ::slotted(*) {
            all: unset;
            display: initial;
        }

        ::slotted(p) {
            display: block;
            font-size: 1.33rem;
            margin-bottom: 1em;
            max-width: 30em;
        }

        ::slotted(li) {
            list-style: none;
        }

        ::slotted(ul) {
            padding-inline-start: 0;
            margin-inline-start: 0;
        }

        @media (orientation: landscape) and (height <= 46rem) and (hover: none) {
            dialog {
                max-width: 75vw;
            }
        }
    `;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.setupStyles();
        this.setAttribute('role', 'dialog');
    }

    setupStyles() {
        const base = this.getBaseStyleSheet();
        const additional = this.getAdditionalStyles?.() || '';
        const style = [base];

        additional && (() => {
            const additionalStyle = new CSSStyleSheet();
            additionalStyle.replaceSync(additional);
            style.push(additionalStyle);
        })();

        this.shadowRoot.adoptedStyleSheets = style;
    }

    getBaseStyleSheet() {
        const style = new CSSStyleSheet();
        style.replaceSync(this.constructor.STYLE);
        return style;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = this.createDialogHTML();
        this.afterRender?.();
    }

    createDialogHeaderHTML() {
        const title = this.getAttribute('title') || '';
        return `<h2 class="dialog-title">${title}</h2>`;
    }

    createDialogHTML() {
        return `<dialog>
            <button command="close" title="Close dialog">&times;</button>
            <header>
                ${this.createDialogHeaderHTML()}
            </header>
            <div class="dialog-content">
                ${this.createDialogContentHTML()}
            </div>
        </dialog>`;
    }

    createDialogContentHTML() {
        return '<slot></slot>';
    }

    get dialog() {
        const dialog = this.shadowRoot.querySelector('dialog');
        return dialog;
    }

    showModal() {
        this.dialog.showModal();
        this.setAttribute('open', '');
        this.dispatchEvent(new Event(Constants.DIALOG_OPEN));
    }

    close() {
        this.dialog.close()
        this.removeAttribute('open');
    }

    setupEventListeners() {
        const _qs = x => this.shadowRoot.querySelector(x);
        const closeButton = _qs('[command=close]');
        closeButton && closeButton.addEventListener('click', () => this.close());

        const dialog = _qs('dialog');
        dialog.addEventListener('close',
            () => this.dispatchEvent(new Event(Constants.DIALOG_CLOSE)));

        // Wire up dialog to any matching buttons
        var buttons = `[command=show-modal][commandfor=${this.id}]`;
        buttons = document.querySelectorAll(buttons);
        buttons.forEach(b => b.addEventListener('click', () => this.showModal()));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const el = this.shadowRoot.querySelector('.dialog-title');
        const shouldUpdate = name == 'title' && el;
        shouldUpdate && (el.textContent = newValue);
    }
}

customElements.define('custom-dialog', CustomDialogComponent);
