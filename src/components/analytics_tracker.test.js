/**
 * @jest-environment jsdom
 */
import {jest} from '@jest/globals';

beforeEach(async () => {
    await jest.unstable_mockModule('./SimpleTemplateComponent.js', () => ({
        default: (name, styles, template, eventHandler) => {
            return class {
                constructor() {
                    this.shadowRoot = { appendChild: jest.fn() };
                    this.eventHandler = eventHandler;
                }

                handleEvent(event) {
                    this.eventHandler.call(this, event);
                }
            };
        }
    }));
});

let AnalyticsComponent;
beforeEach(async () => {
    const module = await import('./analytics_tracker.js');
    AnalyticsComponent = module.default;
});

describe('testing queuing of analytics events until active gtag', () => {
    let component;

    beforeEach(() => {
        window.dataLayer = [];
        window.gtag = jest.fn();

        component = new AnalyticsComponent();
        component.getAttribute = jest.fn().mockReturnValue('UA-TEST-ID');
    });

    test('creates queue when no gtag', () => {
        component.handleEvent({type: 'hashchange', newURL: '#foo', oldURL: '#bar'});

        expect(component._initialized).toBe(true);
        expect(Array.isArray(component._eventQueue)).toBe(true);
    });

    test('new events go to queue when no gtag', () => {
        component.handleEvent({type: 'newRound'});

        expect(component._eventQueue.length).toBe(1);
        expect(component._eventQueue[0].name).toBe('round_started');
    });

    test('new events go to gtag when ready', () => {
        component._gtagReady = true;
        component.handleEvent({type: 'newRound'});

        expect(window.gtag).toHaveBeenCalledWith('event', 'round_started', expect.any(Object));
    });

    test('queued events are sent to gtag when ready', () => {
        component.handleEvent({ type: 'hashchange', newURL: '#foo', oldURL: '#bar' });
        component.handleEvent({ type: 'newRound' });
        component.handleEvent({ type: 'hashchange', newURL: '#test', oldURL: '#start' });

        const originalSetTimeout = global.setTimeout;
        global.setTimeout = jest.fn(callback => callback());

        expect(component._eventQueue.length).toBeGreaterThan(0);
        const scriptGA = component.shadowRoot.appendChild.mock.calls.find(
            call => call[0] && call[0].src && call[0].src.includes('googletagmanager')
        )[0];
        scriptGA.onload();

        global.setTimeout = originalSetTimeout;

        expect(window.gtag).toHaveBeenCalledTimes(3);
        expect(component._eventQueue).toHaveLength(0);
    });
});
