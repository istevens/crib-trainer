'use strict';
export class CardSetComponent extends HTMLElement {
    static STYLE = `
        :host {
            --cardset-card-count: 0;
            --cardset-card-rotation: 7;
            --cardset-card-aspect-ratio: 240/334;
            --cardset-card-background-colour: #c00;
            --cardset-card-decor-colour: #f8f8f8;
            --cardset-card-outline-width-pct: 0.075;
            display: grid;
            grid-auto-flow: column;
            box-sizing: border-box;
            perspective: 1000px;
        }

        :host::part(card) {
            aspect-ratio: var(--cardset-card-aspect-ratio);
            height: 100%;
            overflow: hidden;
            position: relative;
            transform: rotateY(0deg);
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

        :host(.hidden) playing-card img,
        :host(.hidden)::part(card)::before {
            backface-visibility: hidden;
            transition: transform 0.1s ease-in-out;
            transform-style: preserve-3d;
        }

        :host(.hidden) playing-card img {
            transform: rotateY(-180deg);
        }

        :host(.hidden)::part(card)::before {
            position: absolute;
            content: '';
            height: 100%;
            width: 100%;
            background: var(--cardset-card-background-colour, #d00) var(--cardset-card-background-image);
            background-repeat: none;
            background-position: center;
            background-size: 100%;
            border-radius: 6px;
            transform: rotateY(0deg);
        }

        :host(.hidden.reveal) playing-card img {
            transform: rotateY(0deg);
        }

        :host(.hidden.reveal)::part(card)::before {
            transform: rotateY(180deg);
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
    `;

    static observedAttributes = ['cards'];
    static STYLE_PREFIX = '--cardset-card-';
    static preloadedUrls = new Array();

    constructor() {
        super();
        let style = new CSSStyleSheet();
        style.replaceSync(CardSetComponent.STYLE);
        this.attachShadow({mode: "open"});
        this.shadowRoot.adoptedStyleSheets = [style];

        let jitter = this.getAttribute('jitter');
        jitter = jitter == "" && 1 || jitter || 0;
        this.setAttribute('jitter', jitter);
        this.setAttribute('arrangeBy', this.getAttribute('arrangeBy') || 'row');

        this.preloadCardBack();
    }

    preloadCardBack() {
        let url = getComputedStyle(this).getPropertyValue('--cardset-card-background-image').trim();
        url = url.replace(/^url\(['"]?/, '');
        url = url.replace(/['"]?\)$/, '');
        url && CardSetComponent.preloadImage(url);
    }

    // @TODO: Refactor preloading once it's needed twice
    static preloadImage(url) {
        var _preload = url => {
            CardSetComponent.preloadedUrls.push(url);

            const link = document.createElement('link');
            link.href = url;
            link.rel = 'preload';
            link.as = 'image';

            document.head.appendChild(link);
            return true;
        }

        var isPreloaded = url && url !== 'none';
        const urlMatch = url?.match(/url\(['"]?(.*?)['"]?\)/i);
        url = urlMatch && urlMatch[1] || url ;
        isPreloaded = isPreloaded
            && !CardSetComponent.preloadedUrls.includes(url)
            && _preload(url);

        return isPreloaded;
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
        this.updateCardWidths();

        return cards.length;
    }

    updateCardWidths() {
        const updateCardWidth = card => {
            const width = card.getBoundingClientRect().width;
            card.style.setProperty('--cardset-card-width', `${width}px`);
        }
        this.cardNodes.forEach(updateCardWidth);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        let shouldRender = name == 'cards' && newVal != oldVal;
        let newCards = newVal.split(',').map(x => x.trim()) || [];
        let updateCount = (c) => this.style.setProperty(this.getCardStyleName('count'), c);
        shouldRender && updateCount(newCards.length);
        shouldRender && this.renderCards(newCards);
        shouldRender && this.cardNodes.forEach(x => this.jitterCard(x));
    }
}
customElements.define("card-set", CardSetComponent);
