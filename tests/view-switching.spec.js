import { test, expect } from '@playwright/test';

test.describe('View switching on page load', () => {
    test.beforeEach(() => {
        test.setTimeout(5000);
    });

    async function expectUrlToMakeViewActiveAndOtherViewInactive(page, url, active, inactive) {
        await page.goto(url);
        const inactiveView = page.locator(inactive);
        const activeView = page.locator(active);
        await expect(activeView).toBeVisible();
        await expect(inactiveView).not.toBeVisible();
    }

    test('should show start view by default (no hash)', async ({ page }) => {
        await expectUrlToMakeViewActiveAndOtherViewInactive(
            page, '/', '#start', '#play',
        );
    });

    test('should switch to start view when hash is #start', async ({ page }) => {
        await expectUrlToMakeViewActiveAndOtherViewInactive(
            page, '/#start', '#start', '#play',
        );
    });

    test('should switch to start view with empty hash', async ({ page }) => {
        await expectUrlToMakeViewActiveAndOtherViewInactive(
            page, '/#', '#start', '#play',
        );
    });

    test('should switch to start view if hash is unknown', async ({ page }) => {
        await expectUrlToMakeViewActiveAndOtherViewInactive(
            page, '/#foobarbaz', '#start', '#play',
        );
    });

    test('should switch to play view when hash is #play', async ({ page }) => {
        await expectUrlToMakeViewActiveAndOtherViewInactive(
            page, '/#play', '#play', '#start',
        );
    });

    test('should start deal cards if starting in play view', async ({ page }) => {
        await page.goto('/#play');
        const hand = page.locator('#cards #hand');
        await expect(hand).toHaveClass(/dealing/);
    });

    test('should start round if transitioning to play view', async ({ page }) => {
        await page.goto('/');
        const [roundStarted] = await Promise.all([
            page.evaluate(() => new Promise(
                resolve => document.addEventListener("newRound", () => resolve(true), {once: true})
            )),
            page.getByRole('button', {name: 'Play'}).click()
        ]);
        await expect(roundStarted).toBeTruthy();
    });

    test('should switch view even if app initializes after view is handled', async ({ page }) => {
        await page.addInitScript(() => {
            document.addEventListener('appInitialized', (event) => {
                event.stopImmediatePropagation();
                setTimeout(() => 
                    document.dispatchEvent(new CustomEvent('appInitialized')),
                    500);
            }, { once: true, capture: true });

            let viewSwitchedEventDetail = null;
            document.addEventListener('viewSwitched', (event) => {
                viewSwitchedEventDetail = event.detail;
            }, { once: true });

            window.getViewSwitchedEvent = () => viewSwitchedEventDetail;
        });

        await page.goto('/#start', { waitUntil: 'domcontentloaded' });
        const startView = page.locator('#start');
        const playView = page.locator('#play');

        // viewSwitched event should not have fired yet
        let eventDetail = await page.evaluate(() => window.getViewSwitchedEvent());
        expect(eventDetail).toBeNull();

        // wait for it
        await page.waitForFunction(() => window.getViewSwitchedEvent() !== null);

        // view event should eventually fire
        eventDetail = await page.evaluate(() => window.getViewSwitchedEvent());
        expect(eventDetail).not.toBeNull();
        expect(eventDetail.view).toBe('start');
    });

    test('should send view switched event with previous view', async ({ page }) => {
        const transition = () => new Promise(resolve => {
            document.addEventListener("viewSwitched", e => {
                resolve(e.detail);
            }, { once: true });
        });

        await page.goto('/');

        // null -> play
        page.on('framenavigated', () => console.log('Page Navigated!'));
        let firstTransition = page.evaluate(transition);
        await page.getByRole('button', { name: 'Play' }).click();
        firstTransition = await firstTransition;
        expect(firstTransition.previousView).toBe('start');
        expect(firstTransition.view).toBe('play');

        // play -> start
        let secondTransition = page.evaluate(transition); 
        await page.getByText('Crib Trainer').click();
        secondTransition = await secondTransition;
        expect(secondTransition.previousView).toBe('play');
        expect(secondTransition.view).toBe('start');
    });
});
