import TrickListDialogComponent from "./tricklist_dialog.js";

class TricksDialogComponent extends TrickListDialogComponent {
    static observedAttributes = ['play'];

    static ADDITIONAL_STYLES = `
        #lastPlay {
            position: relative;
            gap: calc(2*var(--interItemPadding));
            padding-bottom: calc(2*var(--interItemPadding));
            margin: auto;
            width: 100%;
            flex-direction: row;
        }

        #lastPlay::after {
            position: absolute;
            display: block;
            width: 75%;
            bottom: 0;
            left: 12.5%;
            content: '';
            border-width: 1px 0 0 0;
            border-image: radial-gradient(circle, var(--dialogDecorColour), 75%, rgba(0,0,0,0)) 1 0;
            border-style: solid;
        }

        #lastPlay .trickScore {
            font-size: 4rem;
        }

        #lastCutCard {
            justify-items: flex-start;
        }

        #lastHand {
            justify-items: flex-end;
        }

        #correctScore {
            text-align: center;
            margin-bottom: var(--interItemPadding);
        }

        #lastCards {
            display: flex;
            align-items: center;
            gap: var(--interItemPadding);
            margin-bottom: var(--interItemPadding);
        }

        .trickCategory {
            display: grid;
            grid-template-columns: var(--trickLabelWidth) 1fr;
        }

        .trickCategory:has(li:nth-child(2)) {
            flex: 1 1 100%;
        }

        .trickCategory .trickLabel::before {
            position: absolute;
            left: 0;
            font-size: 2rem;
            font-weight: 700;
        }

        .trickCategory:first-child .trickLabel::before {
            content: '=';
        }

        .trickCategory:not(:first-child) .trickLabel::before {
            content: '+';
        }

        .trickCategory:only-child .trickLabel::before {
            content: '';
        }

        .trickCategory:only-child .trickScore {
            display: none;
        }


        @media (orientation: landscape) and (hover: none) {
            #lastPlay {
                flex-direction: row;
            }

            .trickCategory:not(:has(li:nth-child(3))) {
                flex: 1 1 calc(var(--trickWidth) - 3 * var(--interItemPadding)) !important;
            }

        }
    `;

    showModal(play, expectedScore) {
        this.updateTricks(play, expectedScore);
        super.showModal();
    }

    getAdditionalStyles() {
        let style = super.getAdditionalStyles();
        style += TricksDialogComponent.ADDITIONAL_STYLES;
        return style;
    }

    createDialogContentHTML() {
        return `
            <section id="lastPlay" class="stacked">
                <div id="correctScore">
                    <span class="trickLabel stacked">
                        <span class="trickDescription">
                            Score is
                        </span>
                        <span class="trickScore"></span>
                    </span>
                </div>
                <div id="lastCards" class="stacked">
                    <card-set id="lastCutCard"></card-set>
                    <card-set id="lastHand" jitter="2"></card-set>
                </div>
            </section>
            <ul class="trickList stacked"></ul>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();

        const dialog = this.shadowRoot.querySelector('dialog');
        dialog.addEventListener('click', e => {
            window.getSelection().toString() === '' && this.close();
        });
    }

    updateTricks(play, expectedScore) {
        let _qs = x => this.shadowRoot.querySelector(x);

        (!play || !this.isConnected) && this.close();

        const cutCard = play?.cutCard;
        const hand = play?.hand;

        const scoreElement = _qs('#correctScore .trickScore');
        scoreElement && (scoreElement.textContent = expectedScore);

        const lastCutCard = _qs('#lastCutCard');
        const lastHand = _qs('#lastHand');
        lastCutCard?.setAttribute('cards', cutCard);
        lastHand?.setAttribute('cards', hand.cards.join(' '));

        const tricksEl = _qs('.trickList');
        tricksEl && this.renderTricks(tricksEl, hand, cutCard);
    }

    renderTricks(tricksElement, hand, cutCard) {
        const tricks = Object.entries(hand.getTricks(cutCard));

        const content = tricks.length > 0
            ? tricks.map(trick => this.renderTrickCategory(trick)).join("")
            : this.renderTrickCategory(["tricks", { score: 0, data: [] }]);

        tricksElement.innerHTML = content;
    }

    renderTrickCategory(trick) {
        const [name, {score, data = []}] = trick;
        const count = data.length;

        const trickElements = data.map(cards =>
            `<li><card-set class='trick' cards='${cards}' arrangeBy='fan'></card-set></li>`
        ).join("");

        return `<li class="trickCategory">
            <span class="trickLabel stacked">
                <span class="trickScore">${score}</span>
                <span class="trickDescription">for ${this.formatTrickName(name, count)}</span>
            </span>
            <ul>${trickElements}</ul>
        </li>`;
    }

    formatTrickName(name, count) {
        if(name.includes('nobs')) return name;
        if(count === 0) return "no tricks";

        const prefix = count === 1 ? 'a' : count;
        let formattedName = `${prefix} ${name}`;

        return (count === 1 && formattedName.endsWith('s'))
            ? formattedName.replace(/s$/, '')
            : formattedName;
    }
}
customElements.define('tricks-dialog', TricksDialogComponent);
