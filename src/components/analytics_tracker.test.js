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
        jest.useFakeTimers();
        window.gtag = jest.fn();
        document.body.appendChild(component);

        component.handleEvent({ type: 'hashchange', newURL: '#foo', oldURL: '#bar' });
        component.handleEvent({ type: 'newRound' });
        component.handleEvent({ type: 'hashchange', newURL: '#test', oldURL: '#start' });
        expect(component._eventQueue.length).toBe(3);

        const gaScript = component.shadowRoot.querySelector('script[src*="googletagmanager"]');
        gaScript?.onload()
        expect(gaScript).toBeTruthy();
        expect(gaScript.async).toBe(true);

        jest.advanceTimersByTime(200);

        expect(component._eventQueue).toHaveLength(0);
        expect(window.gtag).toHaveBeenCalledTimes(3);
        expect(window.gtag).toHaveBeenNthCalledWith(1, 'event', 'screen_view', expect.any(Object));
        expect(window.gtag).toHaveBeenNthCalledWith(2, 'event', 'round_started', expect.any(Object));
        expect(window.gtag).toHaveBeenNthCalledWith(3, 'event', 'screen_view', expect.any(Object));

        jest.useRealTimers();
    });
});
