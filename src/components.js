class SimpleTemplateComponent extends HTMLElement {
    constructor(template, updateHandler, styles='') {
        super();
        this._template = template;
        this._updateHandler = updateHandler;
        this._styles = new CSSStyleSheet();
        this._styles.replaceSync(styles);
        this._state = {};
        this.attachShadow({mode: 'open'});
        this.shadowRoot.adoptedStyleSheets = [this._styles];
    }

    connectedCallback() {
        Array.from(this.attributes).forEach(attr => {
            this._state[attr.name] = attr.value;
        });

        this.render();
    }

    handleEvent(ev) {
        this._updateHandler && this.update(this._updateHandler.call(this, ev));
    }

    static create(template, updateHandler, styles='') {
        class DynamicComponent extends SimpleTemplateComponent {
            constructor() {
                super(template, updateHandler, styles);
        }}
        return DynamicComponent;
    }

    render() {
        const compiledTemplate = this._template.replace(
            /\${(\w+)}/g,
            (match, key) => `\${this._state.${key}}`
        );
        const templateFunction = new Function(`return \`${compiledTemplate}\``);
        this.shadowRoot.innerHTML = templateFunction.call(this);
    }

    update(newState) {
        this._state = { ...this._state, ...newState };
        this.render();

        this.dispatchEvent(new CustomEvent('update', {
            detail: {
                state: this._state
            },
            bubbles: true,
            composed: true
        }));
    }
}

function defineComponent(name, template, styles='', updateHandler=null) {
    const ComponentClass = SimpleTemplateComponent.create(template, updateHandler, styles);
    customElements.define(name, ComponentClass);
    return ComponentClass;
}

defineComponent(
    'score-board',
    '<span id="successes">${successes}</span><span id="failures">${failures}</span>',
    `
    :host {
        display: flex;
    }

    span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        height: 100%;
    }

    #successes {
        background-color: var(--successColour);
        color: black;
    }

    #failures {
        background-color: var(--failureColour);
        color: white;
    }`,

    function(ev) {
        const newState = ev.detail.scoresMatch
            ? { successes: parseInt(this._state.successes) + 1 }
            : { failures: parseInt(this._state.failures) + 1 };
        return newState;
    }
);

defineComponent('score-overlay',
    '${selectedScore}',
    `
    :host {
        display: flex;
        position: fixed;
        visibility: hidden;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        letter-spacing: -0.1em;
        text-indent: -0.1em;
        filter: blur(0);
    }

    :host(.active) {
        visibility: visible;
        transition: filter 500ms ease-in;
        filter: blur(0.25em);
    }

    :host(.correct) {
        color: var(--successColour);
    }

    :host(.incorrect) {
        color: var(--failureColour);
    }`,

    function(ev) {
        const scoresMatch = ev.detail.scoresMatch;
        this.classList.toggle('active');
        this.classList.toggle(scoresMatch && 'correct' || 'incorrect');

        this.addEventListener(
            'transitionend',
            () => this.classList.remove('correct', 'incorrect', 'active'),
            {once: true}
        );

        return {
            selectedScore: ev.detail.selectedScore
        };
    }
);

const STYLE = new CSSStyleSheet();
STYLE.replaceSync(`
    :host {
        --cardset-card-count: 0;
        --cardset-card-rotation: 7;
        --cardset-card-aspect-ratio: 240/334;
        display: grid;
        grid-auto-flow: column;
        box-sizing: border-box;
    }

    :host::part(card) {
        aspect-ratio: var(--cardset-card-aspect-ratio);
        height: 100%;
        overflow: hidden;
    }

    :host([arrangeBy=fan]) {
        --cardset-card-maxrotation: calc(var(--cardset-card-rotation) * var(--cardset-card-count) / 2);
        --cardset-card-maxrotationrad: calc(var(--cardset-card-maxrotation) * 3.14159 / 180);
        --cardset-card-padding: calc(0.66rem * abs(sin(var(--cardset-card-maxrotationrad))) * var(--cardset-card-count));

        padding: var(--cardset-card-padding);
        min-height: 100%;
        height: auto;
        width: cover;
    }

    :host([arrangeBy=row])::part(card) {
        --xyjitterbase: calc(0.25rem * var(--cardset-card-jitter));
        --rotjitterbase: calc(3deg * var(--cardset-card-jitter));
        transform: translate(
            calc(var(--xyjitterbase) * var(--cardset-card-xjitter)),
            calc(var(--xyjitterbase) * var(--cardset-card-yjitter))
        ) rotateZ(calc(var(--rotjitterbase) * var(--cardset-card-rotjitter)));
    }

    :host([arrangeBy=fan])::part(card) {
        grid-area: 1 / 1;
        --cardset-card-thiscardrotation: calc(
            360deg + var(--cardset-card-rotation) * 1deg
                * (var(--cardset-card-number) - 1/2 * var(--cardset-card-count))
            );
        transform: rotateZ(var(--cardset-card-thiscardrotation));
        transform-origin: left bottom;
        transform-box: fill-box;
    }
`);

class CardSetComponent extends HTMLElement {
    static observedAttributes = ['cards'];
    static STYLE_PREFIX = '--cardset-card-';

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.adoptedStyleSheets = [STYLE];
        this.cardCount = 0;

        let jitter = this.getAttribute('jitter');
        jitter = jitter == "" && 1 || jitter || 0;
        this.setAttribute('jitter', jitter);
        this.setAttribute('arrangeBy', this.getAttribute('arrangeBy') || 'row');
    }

    cardTemplate(card, i, a) {
        let style = [
            ['number', i],
            ['jitter', this.getAttribute('jitter')]
        ];
        style = style.map(x => this.getCardStyleName(x[0]) + ':' + x[1]);
        style = style.join(';');
        let html = `<playing-card part="card" cid="${card}" style="${style}"></playing-card>`;
        return html;
    }

    getCardStyleName(prop) {
        return CardSetComponent.STYLE_PREFIX + prop;
    }

    setCardStyle(card, prop, value) {
        card.style.setProperty(this.getCardStyleName(prop), value);
        return card;
    }

    jitterCard(card) {
        let rand = () => Math.random() - 0.5;
        let jitters = ['x', 'y', 'rot'];
        jitters = jitters.map(x => [x + 'jitter', rand()]);
        jitters.forEach(x => this.setCardStyle(card, x[0], x[1]));
        return card;
    }

    get cardNodes() {
        let cards = Array.from(this.shadowRoot.childNodes);
        return cards;
    }

    renderCards(cards) {
        let root = this.shadowRoot;
        let existingCards = this.cardNodes;
        let shouldUpdateExisting = existingCards.length == cards.length;
        let updateExisting = () => existingCards.map((x, i) => x.setAttribute('cid', cards[i]));
        let createNew = () => (root.innerHTML = cards.map((...x) => this.cardTemplate(...x)).join(""));

        shouldUpdateExisting && updateExisting() || createNew();

        return cards.length;
    }

    attributeChangedCallback(name, oldVal, newVal) {
        let shouldRender = name == 'cards' && newVal != oldVal;
        let newCards = newVal.split(',').map(x => x.trim()) || [];
        let updateCount = (c) => this.style.setProperty('--cardset-card-count', c);
        shouldRender && updateCount(newCards.length);
        shouldRender && this.renderCards(newCards);
        shouldRender && this.cardNodes.forEach(x => this.jitterCard(x));
    }
}

customElements.define("card-set", CardSetComponent);
