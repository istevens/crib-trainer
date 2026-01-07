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

    let url = 'card-back.042b261a.svg';

    beforeEach(() => {
        jest.useFakeTimers();

        global.Image = class {
            set src(v) { this._src = v; }
            get src() { return this._src; }
            decode() { return Promise.resolve(); }
        };
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();

        CardSetComponent.preloadedUrls.clear();
        document.body.innerHTML = '';
        document.head.innerHTML = '';
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

    function addCardSet() {
        jest.spyOn(window, 'requestAnimationFrame')
            .mockImplementation(cb => cb());

        document.body.innerHTML = `<style>
            card-set {
                --cardset-card-background-image: url("${url}");
            } </style>
            <card-set cards="4C"></card-set>`;
    }

    test('render waits for card back to decode before rendering', async () => {
        addCardSet();

        const el = document.querySelector('card-set');
        el.setAttribute('cards', 'AC');
        expect(el.classList).toContain('rendering');
        await el._cardBackReady;
        expect(el.classList).not.toContain('rendering');
    });

    test('card back preload only added once across components', async () => {
        jest.spyOn(window, 'requestAnimationFrame')
            .mockImplementation(cb => setTimeout(cb, 0));

        jest.spyOn(
            CardSetComponent.prototype,
            '_extractCardBackUrl').mockReturnValue(url);

        expect(CardSetComponent.preloadedUrls.size).toBe(0);
        const e1 = document.createElement('card-set');
        const e2 = document.createElement('card-set');
        document.body.appendChild(e1, e2)

        jest.runAllTimers();
        await Promise.resolve();

        expect(CardSetComponent.preloadedUrls.size).toBe(1);
    });

    test('should maintain "rendering" class until image is preloaded and decoded', async () => {
        let resolveDecode;
        const decodePromise = new Promise(resolve => { resolveDecode = resolve; });

        global.Image = class {
            set src(v) { this._src = v; }
            decode() { return decodePromise; }
        };

        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
        document.body.innerHTML = `
            <style>card-set { --cardset-card-background-image: url("${url}"); }</style>
            <card-set class="hidden" cards="AC"></card-set>
        `;
        const el = document.querySelector('card-set');

        expect(el.classList.contains('rendering')).toBe(true);
        await resolveDecode();
        await Promise.resolve();
        await Promise.resolve();
        expect(el.classList.contains('rendering')).not.toBe(true);
    });
});
