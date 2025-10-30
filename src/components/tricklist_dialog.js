import CustomDialogComponent from "./custom_dialog.js";

export default class TrickListDialogComponent extends CustomDialogComponent {
    static ADDITIONAL_STYLES = `
        :host, ::slotted(p) {
            font-size: 1rem;
            font-weight: 700;
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
            min-height: min(12vh, 5rem);
            max-height: min(20vh, 10rem);
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
            font-size: 2rem;
            line-height: 75%;
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

        @media (height > 42rem) {
            :host {
                --outerPadding: 1rem;
                --interItemPadding: 0.75rem;
            }

            :host, ::slotted(p) {
                font-size: 1.25rem;
            }

            .trickScore,
            .trickScore::before {
                font-size: 3rem;
            }
        }

        @media (width > 40rem /* maxTitleWidth */ )
                or ((orientation: landscape) and (hover:none)) {
            .trickList {
                --trickWidth: 33%;
                --trickLabelWidth: 6rem;
            }
        }

        @media (orientation: landscape) and (hover: none) {
            cribbage-cards::part(cut_card),
            cribbage-cards::part(hand),
            card-set {
                min-height: min(20vh, 6rem) !important;
                max-height: min(20vh, 10rem);
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
