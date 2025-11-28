import TrickListDialogComponent from "./tricklist_dialog.js";

class TricksDialogComponent extends TrickListDialogComponent {
    static observedAttributes = ['play'];

    static ADDITIONAL_STYLES = `
        :root {
            min-width: calc(4*var(--trickLabelWidth));
            margin-bottom: calc(2*var(--interItemPadding));
        }

        #lastPlay {
            width: 75%;
            max-width: 20rem;
            flex-direction: column;
            gap: calc(2*var(--interItemPadding));
            margin: auto;
            margin-bottom: calc(2*var(--interItemPadding));
        }

        #lastPlay .trickScore {
            font-size: 3rem;
        }

        cribbage-cards {
            display: grid;
            grid-auto-flow: column;
            grid-template-columns: 1fr 2fr;
            gap: var(--interItemPadding);
        }

        cribbage-cards::part(cut_card) {
            justify-items: flex-start;
        }

        cribbage-cards::part(hand) {
            justify-items: flex-end;
            justify-content: flex-end;
        }

        #correctScore {
            text-align: center;
        }

        .trickList {
            margin-top: calc(4*var(--interItemPadding));
        }

        .trickCategory {
            grid-template-columns: var(--trickLabelWidth) 1fr;
        }

        .trickCategory:not(:has(li:nth-child(2))) {
            flex: 1 1 calc(var(--trickWidth) - 2 * var(--interItemPadding));
        }

        .trickCategory:first-child .trickScore::before {
            content: '';
        }

        .trickCategory:only-child .trickScore::before {
            display: none;
        }

        .trickCategory:only-child {
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin: calc(2*var(--interItemPadding)) inherit;
            width: 100%;
        }

        .trickCategory:not(:has(li:nth-child(2))):has(ul:only-child)) .trickLabel {
            justify-content: flex-start;
            margin: 0;
        }

        .trickCategory:only-child .trickScore {
            display: none;
        }

        .trickCategory:only-child ul {
            flex-direction: row;
        }

        .trickCategory:only-child ul li {
            flex: 0 0 var(--trickLabelWidth);
        }

        @media (height > 45rem) {
            #lastPlay .trickScore {
                font-size: 5rem;
            }

            .trickList {
                --trickWidth: 6rem;
            }
        }

        @media (width >= 40rem /* maxTitleWidth */ )
                or ((orientation: landscape) and (hover:none)) {
            :host {
                --min-card-height: min(14vh, 5rem);
            }

            #lastPlay .trickScore {
                font-size: 4rem;
            }
        }

        @media (orientation: landscape) and (height < 45rem) and (hover: none) {
            #lastPlay {
                flex-direction: row;
            }

            .trickList {
                gap: calc(4*var(--interItemPadding));
            }

            .trickCategory:not(:has(li:nth-child(3))) {
                flex: 1 1 calc(var(--trickWidth) - 4 * var(--interItemPadding)) !important;
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

    createDialogHeaderHTML() {
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
                <cribbage-cards id="lastCards"></cribbage-cards>
            </section>`;
    }

    createDialogContentHTML() {
        return '<ul class="trickList stacked"></ul>';
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

        const cards = _qs('cribbage-cards');
        cards.setAttribute('cut_card', cutCard);
        cards.setAttribute('hand', hand.cards.join(','));

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

        var trickElements = data.map(cards =>
            `<li><card-set class='trick' cards='${cards}' arrangeBy='fan'></card-set></li>`
        ).join("");
        trickElements = trickElements && `<ul>${trickElements}</ul>`;

        return `<li class="trickCategory">
            <span class="trickLabel stacked">
                <span class="trickScore">${score}</span>
                <span class="trickDescription">for ${this.formatTrickName(name, count)}</span>
            </span>
            ${trickElements}
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
