(function() {
    const appReady = new Promise((resolve) =>
        document.addEventListener(
            'appInitialized', 
            () => resolve(true),
            { once: true }
        )
    );

    window.switchToActiveView = function() {
        const start = '#start';
        let target = window.location.hash || start;
        target = document.querySelector(target);
        target = target || document.querySelector(start);

        appReady.then(() => document.dispatchEvent(
            new CustomEvent('viewSwitched', {
                bubbles: true,
                detail: {
                    view: target.id,
                    previousView: document.querySelector('.view.activeContent')?.id
                }
            })
        ));

        document.querySelectorAll('.view').forEach(view => {
            const isActive = view === target;
            const _cl = view.classList;
            _cl.toggle('activeContent', isActive);
            _cl.toggle('inactiveContent', !isActive);
        });

        return target;
    };

    const waitForViewBeforeSwitching = function() {
        let targetId = window.location.hash?.slice(1);
        targetId = targetId === "play" && targetId || 'start';

        const switchView = (found=true, observer=null) => {
            if(found) {
                window.switchToActiveView();
                observer?.disconnect();
            }
            return found;
        };

        const waitForView = (targetId) => {
            const observer = new MutationObserver((mutations, obs) => {
                const found = mutations.some(mutation =>
                    Array.from(mutation.addedNodes).some(node => {
                        return node.id === targetId
                    })
                );

                switchView(found, obs);
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });

            return true;
        }

        const needToWaitForView = !document.getElementById(targetId);
        needToWaitForView && waitForView(targetId) || switchView();
    }

    waitForViewBeforeSwitching();
})();
