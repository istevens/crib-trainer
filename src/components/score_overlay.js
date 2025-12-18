import * as Constants from "../constants.js";
import defineComponent from "./SimpleTemplateComponent.js";

const CORRECT = 'correct';
const INCORRECT = 'incorrect';
const ACTIVE = 'active';
const LOW_SCORE = 'lowScore';
const MEDIUM_SCORE = 'mediumScore';
const HIGH_SCORE = 'highScore';

export default defineComponent('score-overlay',
    '<div>${selectedScore}</div>',
    `
    :host {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-auto-flow: column;
        gap: 0.05em;
        align-content: center;
        align-items: center;
        text-align: center;
        visibility: hidden;
        position: absolute;
        inset: 0;
        width: 100vw;
        height: 100vh;
        max-height: 100%;
        max-width: 100%;
        filter: blur(0);
        font-weight: 700;
    }

    :host div {
        letter-spacing: -0.1em;
        margin-right: 0.1em;
    }

    :host(.active) {
        visibility: visible;
        transition: filter 500ms ease-in;
        filter: blur(0.25em);
    }

    :host(.lowScore) {
        font-size: clamp(14em, 72vw, 36em);
    }

    :host(.mediumScore) {
        font-size: clamp(12em, 56vw, 36em);
    }

    :host(.highScore) {
        font-size: clamp(10em, 48vw, 36em);
    }

    :host::before,
    :host::after {
        font-size: 50%;
    }

    :host::before {
        justify-self: flex-end;
    }

    :host::after {
        justify-self: flex-start;
    }

    :host(.correct) { color: var(--successColour); }
    :host(.incorrect) { color: var(--failureColour); }

    /* TODO: Use x and checkmark glyphs with more reliable rendering */
    :host(.correct)::before { margin-right: 0.1em; }
    :host(.correct)::before,
    :host(.correct)::after {
        content: "\\2713";
    }

    :host(.incorrect)::before,
    :host(.incorrect)::after {
        content: "\\2717";
    }`,

    function(ev) {
        const scoresMatch = ev.detail.scoresMatch;
        const selectedScore = ev.detail.selectedScore;
        this.classList.toggle(ACTIVE);
        this.classList.toggle(scoresMatch && CORRECT || INCORRECT);

        let scoreSize = selectedScore < 10 && LOW_SCORE
            || selectedScore >= 10 && selectedScore < 20 && MEDIUM_SCORE
            || selectedScore >= 20 && HIGH_SCORE;
        this.classList.add(scoreSize);

        this.addEventListener(
            'transitionend',
            () => this.classList.remove(CORRECT, INCORRECT, ACTIVE, LOW_SCORE, MEDIUM_SCORE, HIGH_SCORE),
            {once: true}
        );

        return {
            selectedScore: selectedScore
        };
    },

    [Constants.SCORE_SELECTED]
);
