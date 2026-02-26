/**
 * @jest-environment jsdom
 */
import {jest} from '@jest/globals';
import {setImmediate} from 'timers'

let CardSetComponent;
beforeEach(async () => {
    jest.unstable_mockModule('/cardmeister.github.io/elements.cardmeister.min.js', () => ({
        default: {},
    }));

    const module = await import('./card_set.js');
    CardSetComponent = module.default;
});

describe('testing preload for card-set back', () => {

    let url = 'card-back.042b261a.svg';
    let resolveDecode;
    let decodePromise;

    beforeEach(() => {
        jest.useFakeTimers();

        decodePromise = new Promise(resolve => { resolveDecode = resolve; });
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
        CardSetComponent.preloadedUrls?.clear();
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

    function addCardSet() {
        document.body.insertAdjacentHTML('beforeend', `<style>
            card-set {
                --cardset-card-background-image: url("${url}");
            } </style>
            <card-set class="hidden" cards="4C"></card-set>`);
        const el = document.querySelector('card-set');
        return el;
    }

    test('extracts url in style with quotes', () => {
        expectCardBackUrlToBeExtracted(`"${url}"`, url);
    });

    test('extracts url in style sans quotes', () => {
        expectCardBackUrlToBeExtracted(`${url}`, url);
    });

    test('render adds preloading to image warmer to pre-decode image', async () => {
        const el = addCardSet();
        expect(el.classList.contains('rendering')).toBe(true);

        resolveDecode();
        jest.runAllTimers();
        await new Promise(setImmediate);

        let link = document.body.querySelector('#card-set-warmer .card-set-preload');
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

        jest.runAllTimers();
        await new Promise(setImmediate);

        links = document.body.querySelectorAll('#card-set-warmer .card-set-preload');
        expect(CardSetComponent.preloadedUrls.size).toBe(1);
        expect(links.length).toBe(1);
    });

    test('should maintain "rendering" class until image is preloaded and decoded', async () => {
        const el = addCardSet();

        expect(el.classList.contains('rendering')).toBe(true);
        resolveDecode();
        expect(el.classList.contains('rendering')).toBe(true);
        jest.runAllTimers();
        expect(el.classList.contains('rendering')).toBe(true);
        await new Promise(setImmediate);
        expect(el.classList.contains('rendering')).not.toBe(true);
    });

    test('should not re-enter rendering state when cards change but bg same', async () => {
        const el = addCardSet();

        resolveDecode();
        jest.runAllTimers();
        await new Promise(setImmediate);

        expect(el.classList.contains('rendering')).not.toBe(true);
        el.setAttribute('cards', '2H,3H');
        expect(el.classList.contains('rendering')).not.toBe(true);
    });

    test('should not maintain "rendering" if no image to preload', async () => {
        document.body.insertAdjacentHTML('beforeend', '<card-set class="hidden" cards="4C" style="--cardset-card-background-image: none;"></card-set>');
        const el = document.querySelector('card-set');

        expect(el.classList.contains('rendering')).toBe(true);
        jest.runAllTimers();
        await new Promise(setImmediate);
        expect(el.classList.contains('rendering')).toBe(false);
    });

    test('should have no cards if none specified', async () => {
        document.body.insertAdjacentHTML('beforeend', '<card-set cards=""></card-set>');
        const el = document.querySelector('card-set');

        jest.runAllTimers();
        const cards = el.shadowRoot.querySelectorAll('playing-card');
        expect(cards).toHaveLength(0);
    });
});
