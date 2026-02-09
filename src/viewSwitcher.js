window.switchToView = function(selector) {
    const target = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;

    if(!target) return;

    document.querySelectorAll('.view').forEach(view => {
        const isActive = view === target;
        const _cl = view.classList;
        _cl.toggle('activeContent', isActive);
        _cl.toggle('inactiveContent', !isActive);
    });
};
