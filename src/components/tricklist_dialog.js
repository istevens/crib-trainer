import CustomDialogComponent from "./custom_dialog.js";

export default class TrickListDialogComponent extends CustomDialogComponent {
    static ADDITIONAL_STYLES = `
        :host, ::slotted(p) {
            font-size: 1rem;
            font-weight: 700;
            --min-card-height: min(12vh, 3rem);
            --max-card-height: min(20vh, 10rem);
        }

        li {
            list-style: none;
        }

        ul {
            padding-inline-start: 0;
            margin-inline-start: 0;
        }

        cribbage-cards::part(cut_card),
        cribbage-cards::part(hand),
        card-set {
            height: auto;
            min-height: var(--min-card-height);
            max-height: var(--max-card-height);
            min-inline-size: var(--min-card-height);
        }

        /* @TODO Fix duplication of .stacked from style.css  */
        .stacked {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .trickLabel {
            position: relative;
            place-items: center;
            min-width: var(--trickLabelWidth);
            margin: auto;
        }

        .dialog-content .trickScore::before {
            content: '+';
        }

        .trickScore {
            display: block;
            line-height: 75%;
        }

        .trickScore,
        .trickScore::before {
            font-size: 2rem;
        }

        .trickList {
            --trickWidth: 50%;
            --trickLabelWidth: 5rem;
            text-align: center;
            display: flex;
            flex-direction: row;
            flex-flow: wrap;
            align-items: flex-start;
            gap: calc(2*var(--interItemPadding));
            flex: 1;
            margin: 0;
        }

        .trickDescription {
            width: 75%;
        }

        .trickCategory {
            display: grid;
            gap: var(--interItemPadding);
            width: 100%;
            max-width: 100%;
        }

        .trickCategory ul {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-evenly;
            align-items: center;
            place-items: center;
            gap: var(--interItemPadding);
        }

        ::slotted(p) {
            text-align: center;
        }

        @media (height > 46rem) {
            :host {
                --outerPadding: 1rem;
                --min-card-height: min(15vh, 5rem);
            }

            :host, ::slotted(p) {
                font-size: 1.25rem;
            }
        }

        @media (height > 46rem) or (width > 40rem) /* maxTitleWidth */ {
            :host {
                --interItemPadding: 0.75rem;
            }

            .trickScore,
            .trickScore::before {
                font-size: 2.5rem;
            }
        }

        @media (width > 40rem /* maxTitleWidth */ ) {
            :host {
                --min-card-height: min(10vh, 5rem);
            }

            .trickList {
                --trickWidth: 33%;
                --trickLabelWidth: 6rem;
            }
        }
    `
    constructor() {
        super();
    }

    getAdditionalStyles() {
        return TrickListDialogComponent.ADDITIONAL_STYLES;
    }
}
