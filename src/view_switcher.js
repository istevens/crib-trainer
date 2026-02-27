(function() {
    let activeView = null;

    const appReady = new Promise((resolve) =>
        document.addEventListener(
            'appInitialized', 
            () => resolve(true),
            { once: true }
        )
    );

    const getUrlHash = () => {
        var target = window.location.hash?.slice(1);
        target = target === 'play' && target || 'start';
        return target;
    }

    const handleViewChange = () => {
        let targetView = getUrlHash();
        const previousView = activeView || null;
        const viewHasChanged = targetView !== previousView;

        viewHasChanged && (activeView = targetView);
        viewHasChanged && appReady.then(() => document.dispatchEvent(
            new CustomEvent('viewSwitched', {
                bubbles: true,
                detail: { view: targetView, previousView: previousView }
            })
        ));
    };

    window.addEventListener('hashchange', handleViewChange);
    handleViewChange();
})();
