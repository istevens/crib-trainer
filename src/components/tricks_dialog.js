import TrickListDialogComponent from "./tricklist_dialog.js";

class TricksDialogComponent extends TrickListDialogComponent {
    static observedAttributes = ['play'];

    static ADDITIONAL_STYLES = `
        :root {
            min-width: calc(4*var(--trickLabelWidth));
            margin-bottom: calc(2*var(--interItemPadding));
        }

        /* @TODO Fix duplication of .stacked from style.css  */
        .stacked {
            display: flex;
            flex-direction: column;
            align-items: center;
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
            grid-template-columns: 1fr 4fr;
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
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-around;
            align-items: center;
            margin-top: calc(4*var(--interItemPadding));
        }

        .trickCategory {
            flex: 1 1 auto;
            grid-template-columns: var(--trickLabelWidth) 1fr;
            gap: calc(var(--interItemPadding));
        }

        .trickCategory:first-child .trickScore::before {
            content: '';
        }

        .trickCategory:only-child {
            grid-template-columns: 1fr;
            min-height: 10rem;
        }

        .trickCategory:only-child ul {
            grid-column: 1;
        }

        .trickCategory:only-child .trickScore {
            display: none;
        }


        @media (height > 45rem) {
            #lastPlay .trickScore {
                font-size: 5rem;
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

            .trickList {
                justify-content: center;
            }

            .trickCategory {
                flex: initial;
            }
        }

        @media (orientation: landscape) and (height < 45rem) and (hover: none) {
            #lastPlay {
                flex-direction: row;
            }

            .trickList {
                gap: calc(4*var(--interItemPadding));
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
        return '<ul class="trickList"></ul>';
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
