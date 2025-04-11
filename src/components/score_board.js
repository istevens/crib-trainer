import defineComponent from "./simple_template.js";

defineComponent(
    'score-board',
    '<span id="successes">${successes}</span><span id="failures">${failures}</span>',
    `
    :host {
        display: flex;
    }

    span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        height: 100%;
    }

    #successes {
        background-color: var(--successColour);
        color: black;
    }

    #failures {
        background-color: var(--failureColour);
        color: white;
    }`,

    function(ev) {
        const newState = ev.detail.scoresMatch
            ? { successes: parseInt(this._state.successes) + 1 }
            : { failures: parseInt(this._state.failures) + 1 };
        return newState;
    }
);


