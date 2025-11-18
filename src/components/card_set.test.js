/**
 * @jest-environment jsdom
 */
import {jest} from '@jest/globals';

let CardSetComponent;
beforeEach(async () => {
    const module = await import('./card_set.js');
    CardSetComponent = module.default;
});

describe('testing preload for card-set back', () => {
    let url;

    beforeEach(() => {
        url = 'card-back.042b261a.svg';
    });

    test('preloadImage adds url as a link to document', () => {
        CardSetComponent.preloadImage(url);

        const link = document.querySelector('link');
        expect(link).not.toBeNull();
        expect(link.getAttribute('rel')).toBe('preload');
        expect(link.as).toBe('image');
        expect(link.getAttribute('href')).toBe(url);
    });

    test('preloadCardBack calls preloadImage with url in style', () => {
        const preloadSpy = jest.spyOn(CardSetComponent, 'preloadImage');
        document.body.innerHTML = `<style>card-set { --cardset-card-background-image: url("${url}"); }</style>
            <card-set cards="4C"></card-set>`;
        expect(preloadSpy).toBeCalledWith(url);
        preloadSpy.mockRestore();
    });

    test('preloadCardBack calls preloadImage with url in style sans quotes', () => {
        const preloadSpy = jest.spyOn(CardSetComponent, 'preloadImage');
        document.body.innerHTML = `<style>card-set { --cardset-card-background-image: url(${url}); }</style>
            <card-set cards="4C"></card-set>`;
        expect(preloadSpy).toBeCalledWith(url);
        preloadSpy.mockRestore();
    });
});
