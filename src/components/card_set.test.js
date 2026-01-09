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
    let resolveDecode;

    beforeEach(() => {
        jest.useFakeTimers();

        const decodePromise = new Promise(resolve => { resolveDecode = resolve; });
        if(!window.HTMLImageElement.prototype.decode) {
            window.HTMLImageElement.prototype.decode = function() {
                return decodePromise;
            };
        } else {
            jest.spyOn(window.HTMLImageElement.prototype, 'decode').mockReturnValue(decodePromise);
        }
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();

        delete window.HTMLImageElement.prototype.decode;
        CardSetComponent.preloadedUrls.clear();
        CardSetComponent.warmer?.remove();
        CardSetComponent.warmer = null;
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
        document.body.insertAdjacentHTML('beforeend', `<style>
            card-set {
                --cardset-card-background-image: url("${url}");
            } </style>
            <card-set class="hidden" cards="4C"></card-set>`);
        const el = document.querySelector('card-set');
        return el;
    }

    test('render adds preloading to image warmer to pre-decode image', async () => {
        const el = addCardSet();
        expect(el.classList.contains('rendering')).toBe(true);

        let link = document.body.querySelector('#card-set-warmer .card-set-preload');
        expect(link).not.toBeNull();

        await resolveDecode();
        await Promise.resolve();
        await Promise.resolve();

        link = document.body.querySelector('#card-set-warmer .card-set-preload');
        expect(link).not.toBeNull();
        expect(link.style.backgroundImage).toBe(`url(${url})`);
        expect(el.classList.contains('rendering')).toBe(false);
    });

    test('card back preload only added once across components', async () => {
        let links = document.body.querySelectorAll('#card-set-warmer .card-set-preload');
        expect(CardSetComponent.preloadedUrls.size).toBe(0);
        expect(links.length).toBe(0);

        addCardSet();
        addCardSet();

        await Promise.resolve();
        await Promise.resolve();

        links = document.body.querySelectorAll('#card-set-warmer .card-set-preload');
        expect(CardSetComponent.preloadedUrls.size).toBe(1);
        expect(links.length).toBe(1);
    });

    test('should maintain "rendering" class until image is preloaded and decoded', async () => {
        const el = addCardSet();

        expect(el.classList.contains('rendering')).toBe(true);
        await resolveDecode();
        expect(el.classList.contains('rendering')).toBe(true);
        await Promise.resolve();
        expect(el.classList.contains('rendering')).toBe(true);
        await Promise.resolve();
        expect(el.classList.contains('rendering')).not.toBe(true);
    });

    test('should re-enter rendering state when cards change', async () => {
        const el = addCardSet();

        await resolveDecode();
        await Promise.resolve(); await Promise.resolve();

        expect(el.classList.contains('rendering')).not.toBe(true);
        el.setAttribute('cards', '2H,3H');
        expect(el.classList.contains('rendering')).toBe(true); // Should be back to true synchronously
    });
});
