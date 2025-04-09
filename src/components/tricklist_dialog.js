import CustomDialogComponent from "./dialog.js";

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
        }

        .trickLabel {
            position: relative;
            text-align: center;
            place-items: center;
            min-width: var(--trickLabelWidth);
            margin: auto;
        }

        .trickScore {
            display: block;
            font-size: 3rem;
            line-height: 75%;
        }

        .trickList {
            --trickWidth: 50%;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: calc(2*var(--interItemPadding)) var(--interItemPadding);
            flex: 1;
            margin: 0;
        }

        .trickCategory {
            --trickWidth: 50%;
            flex: 1 1 calc(var(--trickWidth) - 2 * var(--interItemPadding)) !important;
        }

        .trickDescription {
            width: 75%;
            font-size: 1rem;
        }

        .trickCategory ul, #lastCards {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-evenly;
            align-items: center;
            place-items: center;
            min-height: 0;
            width: 100%;
        }

        @media (width > 40rem /* maxTitleWidth */ )
                or ((orientation: landscape) and (hover:none)) {
            .trickCategory {
                --trickWidth: 33%;
                --trickLabelWidth: 6rem;
                flex: 1 1 calc(var(--trickWidth) - 3 * var(--interItemPadding)) !important;
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
        }
    `
    constructor() {
        super();
    }

    getAdditionalStyles() {
        return TrickListDialogComponent.ADDITIONAL_STYLES;
    }
}
