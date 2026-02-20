import { test, expect } from '@playwright/test';

test.describe('View switching on page load', () => {
    async function expectUrlToMakeViewActiveAndOtherViewInactive(page, url, active, inactive) {
        await page.goto(url);
        const inactiveView = page.locator(inactive);
        const activeView = page.locator(active);
        await expect(activeView).toHaveClass(/\bactiveContent\b/);
        await expect(activeView).not.toHaveClass(/\binactiveContent\b/);
        await expect(activeView).toBeVisible();
        await expect(inactiveView).toHaveClass(/\binactiveContent\b/);
        await expect(inactiveView).not.toHaveClass(/\bactiveContent\b/);
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

    test('should start round if starting in play view', async ({ page }) => {
        let roundStarted = false;
        await page.exposeFunction('onNewRound', () => { roundStarted = true; });
        await page.addInitScript(() => {
            document.addEventListener('newRound', () => window.onNewRound(), {once: true});
        });

        await page.goto('/#play');
        test.setTimeout(5000);
        await expect.poll(() => roundStarted).toBeTruthy();

    });

    test('should start round if transitioning to play view', async ({ page }) => {
        await page.goto('/');
        test.setTimeout(5000);
        const [roundStarted] = await Promise.all([
            page.evaluate(() => new Promise(
                resolve => document.addEventListener("newRound", () => resolve(true), {once: true})
            )),
            page.getByRole('button', {name: 'Play'}).click()
        ]);
        await expect(roundStarted).toBeTruthy();
    });

    test('should switch view even if app initializes well after switchToActiveView is called', async ({ page }) => {
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

        await page.goto('/#start');
        const startView = page.locator('#start');
        const playView = page.locator('#play');
        await expect(startView).toHaveClass(/\bactiveContent\b/);
        await expect(playView).toHaveClass(/\binactiveContent\b/);

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

    test('should switch view even if switchToActiveView called after target exists', async ({ page }) => {
        // Need to set content manually and invoke hash manually
        // as goto will populate the page with the app instead
        await page.setContent(`
            <div id="start" class="view"></div>
            <div id="play" class="view"></div>
        `);
        await page.evaluate(() => { window.location.hash = '#play'; });

        // Execute script to see if view is caught after the fact
        await page.addScriptTag({ path: './src/viewSwitcher.js' });

        const playView = page.locator('#play');
        await expect(playView).toHaveClass(/\bactiveContent\b/, { timeout: 3000 });
    });
});
