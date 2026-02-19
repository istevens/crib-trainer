(function() {
    let appInit = false;
    let queuedEvent = null;

    document.addEventListener('appInitialized', () => {
        queuedEvent && document.dispatchEvent(queuedEvent);
        queuedEvent = null;
        appInit = true;
    }, { once: true });

    window.switchToActiveView = function() {
        const start = '#start';
        let target = window.location.hash || start;
        target = document.querySelector(target);
        target = target || document.querySelector(start);

        queuedEvent = new CustomEvent('viewSwitched', {
            bubbles: true,
            detail: {
                view: target.id,
                previousView: document.querySelector('.view.activeContent')?.id
            }
        });
        appInit && queuedEvent && document.dispatchEvent(queuedEvent);

        document.querySelectorAll('.view').forEach(view => {
            const isActive = view === target;
            const _cl = view.classList;
            _cl.toggle('activeContent', isActive);
            _cl.toggle('inactiveContent', !isActive);
        });

        return target;
    };

    let targetId = window.location.hash;
    targetId = targetId === "#play" && targetId || '#start';

    const observer = new MutationObserver((mutations, obs) => {
        const found = mutations.some(mutation =>
            Array.from(mutation.addedNodes).some(node =>
                node.id === targetId.slice(1)
            )
        );

        if(found) {
            window.switchToActiveView();
            obs.disconnect();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
