class CustomDialogComponent extends HTMLElement {
    static observedAttributes = ['title'];

    static STYLE = `
        :host {
            display: none;
            position: relative;
        }

        :host([open]) {
            display: block !important;
        }

        dialog {
            display: none;
            padding: var(--outerPadding);
            background: var(--dialogColour);
            border: inherit;
            border-radius: inherit;
            max-width: min(90vw, 45rem);
            max-height: 90vh;
            width: auto;
        }

        dialog[open] {
            display: flex;
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

        .dialog-content ::slotted(*) {
            all: unset;
            display: initial;
        }

        .dialog-content ::slotted(p) {
            display: block;
            margin-bottom: var(--interItemPadding);
        }
    `;

    static TEMPLATE = (title, content) => `<dialog>
        <header>
            <h2 class="dialog-title">${title}</h2>
            <button class="dialog-close" command="close">&times;</button>
        </header>
        <div class="dialog-content">
            <slot></slot>
        </div>
    </dialog>
    `;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        const style = new CSSStyleSheet();
        style.replaceSync(CustomDialogComponent.STYLE);
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const title = this.getAttribute('title') || '';
        this.shadowRoot.innerHTML = CustomDialogComponent.TEMPLATE(title);
    }

    get dialog() {
        const dialog = this.shadowRoot.querySelector('dialog');
        return dialog;
    }

    open() {
        this.dialog.open();
        this.setAttribute('open', '');
        this.dispatchEvent(new Event('open'));
    }

    showModal() {
        this.dialog.showModal();
        this.setAttribute('open', '');
        this.dispatchEvent(new Event('open'));
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
        dialog.addEventListener('close', ev => this.dispatchEvent(new Event('close')));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const el = this.shadowRoot.querySelector('.dialog-title');
        const shouldUpdate = name == 'title' && el;
        shouldUpdate && (el.textContent = newValue);
    }
}
customElements.define('custom-dialog', CustomDialogComponent);

