/**
 * @jest-environment jsdom
 */
import {jest} from '@jest/globals';

let ScoreOverlayComponent;
beforeEach(async () => {
    const module = await import('./score_overlay.js');
    ScoreOverlayComponent = module.default;
});

describe('testing display of just-selected score', () => {
    let component;

    beforeEach(() => {
        component = new ScoreOverlayComponent();
    });

    let expectHasScoreClass = (score, scoreClass) => {
        component.handleEvent({
            type: 'score_selected',
            detail: {selectedScore: score}
        });
        expect(component.classList).toContain(scoreClass);
    }

    test('score under 10 has lowScore class', () => {
        expectHasScoreClass(5, 'lowScore');
    });

    test('score of 10 has mediumScore class', () => {
        expectHasScoreClass(10, 'mediumScore');
    });

    test('score over 10 under 20 has mediumScore class', () => {
        expectHasScoreClass(15, 'mediumScore');
    });

    test('score of 20 has highScore class', () => {
        expectHasScoreClass(20, 'highScore');
    });

    test('score above 20 has highScore class', () => {
        expectHasScoreClass(25, 'highScore');
    });
});
