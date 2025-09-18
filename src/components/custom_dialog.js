import * as Constants from '../constants.js';

export default class CustomDialogComponent extends HTMLElement {
    static observedAttributes = ['title'];

    static STYLE = `
        :host {
            --dialogColour: hsl(43, 100%, 92%);
            --dialogDecorColour: hsl(43, 100%, 20%);
            display: none;
        }

        /* @TODO Fix duplication of .stacked from style.css  */
        .stacked {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        :host([open]) {
            display: block !important;
        }

        dialog {
            padding: var(--outerPadding);
            background: var(--dialogColour);
            border: inherit;
            border-radius: inherit;
            border: 1px solid black;
            max-width: min(90vw, var(--maxTitleWidth));
            max-height: 90vh;
            width: auto;
            touch-action: inherit;
        }

        dialog[open] {
            display: flex;
            position: absolute;
            flex-direction: column;
            justify-items: center;
            gap: var(--interItemPadding);
        }

        header {
            display: flex;
            justify-content: space-between;
        }

        .dialog-title {
            width: 100%;
            font-size: 2rem;
            font-weight: 700;
            text-align: center;
            margin: 0;
        }

        .dialog-close {
            position: absolute;
            top: 0;
            right: 0;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: inherit;
        }

        .dialog-content {
            flex: 1;
        }

        .dialog-content span {
            font-weight: 700;
        }

        .dialog-content ::slotted(*) {
            all: unset;
            display: initial;
        }

        .dialog-content ::slotted(p) {
            display: block;
            margin-bottom: var(--interItemPadding);
        }

        .dialog-content ::slotted(li) {
            list-style: none;
        }

        .dialog-content ::slotted(ul) {
            padding-inline-start: 0;
            margin-inline-start: 0;
        }

        @media (orientation: landscape) and (hover: none) {
            dialog {
                max-width: min(90vw, calc(2*var(--maxTitleWidth)));
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

    createDialogHTML() {
        const title = this.getAttribute('title') || '';
        return `<dialog>
            <header>
                <h2 class="dialog-title">${title}</h2>
                <button class="dialog-close" command="close">&times;</button>
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
        const closeButton = _qs('.dialog-close');
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
