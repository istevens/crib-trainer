import * as Constants from "../constants.js";
import defineComponent from "./SimpleTemplateComponent.js";

defineComponent('score-overlay',
    '<div>${selectedScore}</div>',
    `
    :host {
        display: flex;
        position: fixed;
        visibility: hidden;
        width: 100%;
        height: 100%;
        filter: blur(0);
        container-type: inline-size;
        font-weight: 700;
        font-size: clamp(11em, 55vw, 24em);
    }

    :host(.active) {
        visibility: visible;
        transition: filter 500ms ease-in;
        filter: blur(0.25em);
    }

    :host div {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-auto-flow: column;
        gap: 0.1em;
        align-items: center;
        justify-content: center;
        text-align: center;
        letter-spacing: -0.1em;
        margin-right: 0.1em;
    }

    :host div::before,
    :host div::after {
        font-size: 50%;
    }

    :host div::before {
        justify-self: flex-end;
    }

    :host div::after {
        justify-self: flex-start;
    }

    :host(.correct) div { color: var(--successColour); }
    :host(.incorrect) div { color: var(--failureColour); }

    :host(.correct) div::before,
    :host(.correct) div::after {
        content: "\\2713";
    }

    :host(.incorrect) div::before,
    :host(.incorrect) div::after {
        content: "\\2717";
    } `,

    function(ev) {
        const scoresMatch = ev.detail.scoresMatch;
        this.classList.toggle('active');
        this.classList.toggle(scoresMatch && 'correct' || 'incorrect');

        this.addEventListener(
            'transitionend',
            () => this.classList.remove('correct', 'incorrect', 'active'),
            {once: true}
        );

        return {
            selectedScore: ev.detail.selectedScore
        };
    },

    [Constants.SCORE_SELECTED]
);
