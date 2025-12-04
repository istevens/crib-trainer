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

        .trickLabel {
            place-items: center;
            grid-column: 1;
            grid-row: 1 / span all;
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
            --trickLabelWidth: 5rem;
            text-align: center;
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
            align-items: center;
            max-width: 100%;
        }

        .trickCategory ul {
            display: flex;
            flex-wrap: wrap;
            gap: calc(2*var(--interItemPadding));
            justify-content: center;
        }

        ::slotted(p) {
            margin: 0 auto calc(2*var(--interItemPadding)) auto;
            text-align: center;
        }

        @media (height > 42rem) {
            :host {
                --outerPadding: 1rem;
                --min-card-height: min(15vh, 5rem);
            }

            :host, ::slotted(p) {
                font-size: 1.25rem;
            }
        }

        @media (height > 42rem) {
            :host {
                --interItemPadding: 0.75rem;
                --min-card-height: min(10vh, 5rem);
            }
        }

        @media (height > 42rem) or (width > 40rem) /* maxTitleWidth */ {
            .trickScore,
            .trickScore::before {
                font-size: 2.5rem;
            }
        }

        @media (width > 40rem) /* maxTitleWidth */ {
            .trickList {
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
