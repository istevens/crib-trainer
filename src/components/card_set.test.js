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
    let resolveDecode;

    beforeEach(() => {
        url = 'card-back.042b261a.svg';

        const decodePromise = new Promise(r => (resolveDecode = r));

        global.Image = class {
            set src(v) { this._src = v; }
            get src() { return this._src; }
            decode() { return decodePromise; }
        };
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
    test('card back preload only added once across components', () => {
        jest.spyOn(window, 'requestAnimationFrame')
            .mockImplementation(cb => cb());

        document.body.innerHTML = `<style>
            card-set {
                --cardset-card-background-image: url("${url}");
            } </style>
            <card-set cards="AS"></card-set>
            <card-set cards="KD"></card-set>`;

        const links = document.head.querySelectorAll(
            'link[rel="preload"][as="image"]'
        );
        expect(links.length).toBe(0);
    });
});
