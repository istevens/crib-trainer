import CustomDialogComponent from "./dialog.js";

export default class TrickListDialogComponent extends CustomDialogComponent {
    static ADDITIONAL_STYLES = `
        :root {
            --trickWidth: 50%;
        }

        li {
            list-style: none;
        }

        ul {
            padding-inline-start: 0;
            margin-inline-start: 0;
        }

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
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: calc(2*var(--interItemPadding)) var(--interItemPadding);
            flex: 1;
            margin: 0;
        }

        .trickCategory {
            display: grid;
            grid-template-columns: var(--trickLabelWidth) 1fr;
            gap: var(--interItemPadding);
            flex: 1 1 100%;
            max-width: 100%;
        }

        .trickCategory:not(:has(li:nth-child(2))) {
            flex: 1 1 calc(var(--trickWidth) - 2 * var(--interItemPadding));
            gap: 0;
        }

        .trickCategory:not(:has(li:nth-child(2))) .trickLabel {
            min-width: var(--trickLabelWidth);
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

        @media (width > 40rem /* maxTitleWidth */ ) {
            :root {
                --trickWidth: 33%;
                --trickLabelWidth: 6rem;
            }

            .trickCategory:not(:has(li:nth-child(3))) {
                flex: 1 1 calc(var(--trickWidth) - 2 * var(--interItemPadding));
            }

            .trickCategory:not(:has(li:nth-child(3))) .trickLabel {
                min-width: var(--trickLabelWidth);
            }
        }

        @media (orientation: landscape) and (hover: none) {
            :root {
                --trickWidth: 33%;
            }

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
