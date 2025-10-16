import CustomDialogComponent from "./custom_dialog.js";

export default class TrickListDialogComponent extends CustomDialogComponent {
    static ADDITIONAL_STYLES = `
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
            pointer-events: none;
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

        .trickScore {
            display: block;
            font-size: 3rem;
            line-height: 75%;
            padding: 0 calc(2*var(--interItemPadding));
        }

        .trickList .trickScore::before {
            content: '+';
            font-size: 2rem;
            font-weight: 700;
        }

        .trickList {
            --trickWidth: 50%;
            --trickLabelWidth: 5rem;
            text-align: center;
            display: flex;
            flex-direction: row;
            flex-flow: wrap;
            align-items: flex-start;
            gap: calc(3*var(--interItemPadding)) var(--interItemPadding);
            flex: 1;
            margin: 0;
        }

        .trickDescription {
            width: 75%;
            font-size: 1rem;
        }

        .trickCategory ul {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-evenly;
            align-items: center;
            place-items: center;
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
                height: auto;
                min-height: min(20vh, 6rem) !important;
                max-height: min(20vh, 10rem);
            }

            #trickList {
                flex-direction: column;
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
