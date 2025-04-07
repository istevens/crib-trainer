import defineComponent from "./simple_template.js";

defineComponent(
    'cribbage-cards',
    '<card-set part="cutCard" cards="${cutCard}"></card-set><card-set part="hand" cards="${hand}" jitter="3"></card-set>',
    `
    :host {
        --cardGroupingFactor: 5;
        display: flex;
        gap: 1rem;
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
    }

    card-set {
        flex: 1 1 0;
        height: 100%;
        min-height: 0;
        padding: var(--interItemPadding);
    }

    :host::part(hand) {
        grid-template-columns: repeat(auto-fit, minmax(0, calc(100% / var(--cardGroupingFactor))));
        justify-items: center;
        justify-content: center;
        width: 100%;
    }

    @media (orientation: landscape) and (hover: none) {
        :host {
            --cardGroupingFactor: 6;
            flex-direction: row !important;
            max-width: calc(var(--maxTitleWidth) + 13rem);
            gap: 2rem;
        }

        :host::part(cutCard) {
            flex: none !important;
            animation: forceRedraw 0.01s forwards;
        }

        @keyframes forceRedraw {
            from { opacity: 0.99; }
            to { opacity: 1; }
        }
    }
    `,
    function(ev) {
        const getCardSet = partName => {
            return this.shadowRoot.querySelector(`[part="${partName}"]`);
        };

        const dealAndFlipCards = () => {
            getCardSet('hand').dealCards();
        }

        setTimeout(dealAndFlipCards, 0);
        const play = ev.detail.play;
        return {
            cutCard: play.cutCard,
            hand: play.hand.cards
        }
    }
);
