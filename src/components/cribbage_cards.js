import defineComponent from "./simple_template.js";

defineComponent(
    'cribbage-cards',
    '<card-set part="cutCard" cards="${cutCard}"></card-set><card-set part="hand" cards="${hand}" jitter="3"></card-set>',
    `
    :host {
        display: flex;
        min-height: 0;
        width: 100%;
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

    :host::part(hand).active {
        transition: transform 500ms ease-in;
    }
    `,
    function(ev) {
        const play = ev.detail.play;
        this.classList.toggle('active');
        this.addEventListener('transitionend', () => this.classList.remove('active'), {once: true});

        return {
            cutCard: play.cutCard,
            hand: play.hand.cards
        };
    }
);
