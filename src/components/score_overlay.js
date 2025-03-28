'use strict';

import defineComponent from "./simple_template.js";

defineComponent('score-overlay',
    '${selectedScore}',
    `
    :host {
        display: flex;
        position: fixed;
        visibility: hidden;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        letter-spacing: -0.1em;
        text-indent: -0.1em;
        filter: blur(0);
    }

    :host(.active) {
        visibility: visible;
        transition: filter 500ms ease-in;
        filter: blur(0.25em);
    }

    :host(.correct) {
        color: var(--successColour);
    }

    :host(.incorrect) {
        color: var(--failureColour);
    }`,

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
    }
);
