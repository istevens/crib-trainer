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

    function expectCardBackUrlToBeExtracted(urlContent, url) {
        const el = document.createElement('card-set');
        el.style.setProperty(
            '--cardset-card-background-image',
            `url(${urlContent})`
        );
        document.body.appendChild(el);

        const extracted = el._extractCardBackUrl();
        expect(extracted).toBe(url);
    }

    test('extracts url in style with quotes', () => {
        expectCardBackUrlToBeExtracted(`"${url}"`, url);
    });

    test('extracts url in style sans quotes', () => {
        expectCardBackUrlToBeExtracted(`${url}`, url);
    });

    test('preloadCardBack is deferred until requestAnimationFrame', () => {
        const gcsSpy = jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
            getPropertyValue: () => `url("${url}")`
        }));

        let rafCallback;
        const rafSpy = jest
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation(cb => (rafCallback = cb));

        const preloadSpy = jest.spyOn(CardSetComponent, 'preloadImage');

        document.body.innerHTML = `<style>
            card-set {
                --cardset-card-background-image: url("${url}");
            }</style><card-set cards="4C"></card-set>`;

        // preload must NOT have run yet
        expect(preloadSpy).not.toHaveBeenCalled();

        // now flush rAF manually
        rafCallback();
        rafSpy.mock.calls[0][0]();
        expect(preloadSpy).toHaveBeenCalledWith(url);
        preloadSpy.mockRestore();
        rafSpy.mockRestore();
        gcsSpy.mockRestore();
    });
});
