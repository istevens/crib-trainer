'use strict';

if(window.CSS && CSS.registerProperty) {
    CSS.registerProperty({
        name: '--cardset-card-background-image',
        syntax: '<url> | none',
        inherits: true,
        initialValue: 'none',
    });
}

export default class CardSetComponent extends HTMLElement {
    static STYLE = `
        :host {
            --cardset-card-count: 0;
            --cardset-card-rotation: 6;
            --cardset-card-aspect-ratio: 240/334;
            --cardset-card-background-colour: #c00;
            display: grid;
            grid-auto-flow: column;
            box-sizing: border-box;
            perspective: 1000px;
        }

        :host playing-card,
        :host playing-card::before {
            aspect-ratio: var(--cardset-card-aspect-ratio);
            height: 100%;
            overflow: hidden;
            position: relative;
            transform: rotateY(0deg);
        }

        :host([arrangeBy=fan]) {
            --cardset-card-maxrotation: calc(var(--cardset-card-rotation) * var(--cardset-card-count) / 2);
            --cardset-card-maxrotationrad: calc(var(--cardset-card-maxrotation) * 3.14159 / 180);
            --cardset-card-padding: calc(0.4rem * abs(sin(var(--cardset-card-maxrotationrad))) * var(--cardset-card-count));

            padding: var(--cardset-card-padding);
            min-width: 0;
            flex: 1 1 auto;
        }

        :host([arrangeBy=row])::part(card) {
            --xyjitterbase: calc(0.25rem * var(--cardset-card-jitter));
            --rotjitterbase: calc(3deg * var(--cardset-card-jitter));
        }

        :host([arrangeBy=row].single) {
            aspect-ratio: var(--cardset-card-aspect-ratio) auto;
        }

        @keyframes slideInFromLeft {
            from {
                transform: translateX(-100vw) translate(0) rotateZ(0);
            }
            to {
                transform: translateX(0)
                        translate(
                            calc(var(--xyjitterbase) * var(--cardset-card-xjitter)),
                            calc(var(--xyjitterbase) * var(--cardset-card-yjitter))
                        ) rotateZ(calc(var(--rotjitterbase) * var(--cardset-card-rotjitter)));
            }
        }

        :host([arrangeBy=row].dealing)::part(card) {
            transform: translateX(-100vw);
        }

        :host([arrangeBy=row]) playing-card.slide-in {
            animation: slideInFromLeft 200ms ease-in forwards !important;
        }

        :host(.hidden) playing-card {
            border-radius: 6px;
        }

        :host(.hidden) playing-card img,
        :host(.hidden) playing-card::before {
            backface-visibility: hidden;
            transition: transform 0.1s ease-in-out;
            transform-style: preserve-3d;
        }

        :host(.hidden) playing-card img {
            transform: rotateY(-180deg);
        }

        :host(.hidden) playing-card::before {
            position: absolute;
            content: '';
            height: 100%;
            width: 100%;
            background: var(--cardset-card-background-colour, #d00) var(--cardset-card-background-image);
            background-repeat: no-repeat;
            background-position: center;
            background-size: 100%;
            transform: rotateY(0deg);
            border-radius: inherit;
            border: 0.01px solid;
        }

        :host(.hidden):is(.rendering) playing-card::before {
            visibility: hidden;
            opacity: 0;
        }

        :host(.hidden):not(.rendering) playing-card::before {
            visibility: visible;
            opacity: 1;
            transition: opacity 0.2s ease-in;
        }

        :host(.hidden.reveal) playing-card img {
            transform: rotateY(0deg);
        }

        :host(.hidden.reveal) playing-card::before {
            transform: rotateY(180deg);
        }

        :host([arrangeBy=fan])::part(card) {
            grid-area: 1 / 1;
            --cardset-card-thiscardrotation: calc(
                360deg + var(--cardset-card-rotation) * 1deg
                    * (var(--cardset-card-number) - calc(var(--cardset-card-count) / 2 - 0.5))
                );
            transform: rotateZ(var(--cardset-card-thiscardrotation));
            transform-origin: bottom center;
            transform-box: fill-box;
            width: 100%;
        }
    `;

    static observedAttributes = ['cards'];
    static STYLE_PREFIX = '--cardset-card-';
    static preloadedUrls = new Map();
    static warmer = null;

    constructor() {
        super();
        let style = new CSSStyleSheet();
        style.replaceSync(CardSetComponent.STYLE);
        this.attachShadow({mode: "open"});
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        let jitter = this.getAttribute('jitter');
        jitter = jitter == "" && 1 || jitter || 0;
        this.setAttribute('jitter', jitter);
        this.setAttribute('arrangeBy', this.getAttribute('arrangeBy') || 'row');

        this.classList.add('rendering');
        requestAnimationFrame(() => {
            import('/cardmeister.github.io/elements.cardmeister.min.js');
            this._ensureCardBackPreloaded();
        });
    }

    attributeChangedCallback(name, oldVal, newVal) {
        const shouldRender = name == 'cards' && newVal != oldVal;
        if(!shouldRender) return;

        const newCards = newVal.split(',').map(x => x.trim()).filter(Boolean) || [];
        this.style.setProperty(this.getCardStyleName('count'), newCards.length);
        this.renderCards(newCards);
        this.cardNodes.forEach(x => this.jitterCard(x));
        newCards.length == 1 && this.classList.add('single');
    }

    _extractCardBackUrl() {
        let url = getComputedStyle(this).getPropertyValue(this.getCardStyleName('background-image')).trim();
        if(url == '') return null;
        url = url.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        return url;
    }

    async _waitForCardBackUrl(maxFrames = 4) {
        const url = this._extractCardBackUrl();
        if(url) return url;
        await new Promise(requestAnimationFrame);
        if(maxFrames > 0) return this._waitForCardBackUrl(maxFrames-1);
        return null;
    }

    async _ensureCardBackPreloaded() {
        const url = await this._waitForCardBackUrl();
        if(!url || url == 'none') return this.classList.remove('rendering');

        try {
            await CardSetComponent.preloadImage(url);
        } finally {
            this.classList.remove('rendering');
        }
    }

    static addToImageWarmer(url) {
        let initWarmer = () => {
            const WARMER_ID = 'card-set-warmer';
            let warmer = document.getElementById(WARMER_ID);
            let hasWarmer = warmer;
            warmer = warmer || document.createElement('div');
            warmer.id = WARMER_ID;
            warmer.style = 'position:fixed;width:1px;height:1px;top:-10px;visibility:hidden;pointer-events:none;overflow:hidden';
            !hasWarmer && document.body.appendChild(warmer);
            return warmer;
        }

        const link = document.createElement('div');
        link.classList.add('card-set-preload');
        link.style.backgroundImage = `url("${url}")`;

        CardSetComponent.warmer = CardSetComponent.warmer || initWarmer();
        CardSetComponent.warmer.appendChild(link);
    }

    // @TODO: Refactor preloading once it's needed twice
    static async preloadImage(url) {
        const preloadAndDecode = (resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.decode()
                .then(() => resolve(true))
                .catch(err => reject(err))

            CardSetComponent.addToImageWarmer(url);
        };

        const loadFromCacheIfAvailable = () => {
            let u = new URL(url, document.baseURI).href;
            let p = this.preloadedUrls.get(u);
            p = p || new Promise(preloadAndDecode);
            this.preloadedUrls.set(u, p);
            return p;
        }

        var cannotPreload = !url || url === 'none';
        let promise = cannotPreload && Promise.resolve(false);
        promise = promise || loadFromCacheIfAvailable();
        return promise;
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

    dealCards() {
        let dealNextCard = cards => {
            let card = this.slideCardIn(cards.length-1);
            card.addEventListener('animationend', () => {
                cards = cards.slice(0, -1);
                cards.length > 0 && dealNextCard(cards) || this.dispatchEvent(new CustomEvent('animationend'));
            }, {once:true});
            return cards;
        }

        this.classList.add('dealing');
        dealNextCard(this.cardNodes);
    }

    slideCardIn(index) {
        let card = this.cardNodes[index];
        card.classList.add('slide-in');
        return card;
    }

    reveal() {
        this.classList.add('reveal');
    }

    get cardNodes() {
        let cards = Array.from(this.shadowRoot.querySelectorAll('playing-card'));
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
}
customElements.define("card-set", CardSetComponent);
