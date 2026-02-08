export default class UIController {
    constructor(app) {
        this.app = app;
    }

    showTricks(expectedScore) {
        const dialog = this.app.root.querySelector('#tricks');
        dialog.showModal(this.app.play, expectedScore);
    }

    switchViews () {
        const _switchTo = x => {
            x = this.app.root.querySelector(x);
            if(!x) return;
            let views = this.app.root.querySelectorAll('.view');
            views.forEach(y => {
                y.classList.remove('activeContent');
                y.classList.add('inactiveContent');
            });
            x.classList.add('activeContent');
            x.classList.remove('inactiveContent');
        }

        let v = window.location.hash || '#start';
        _switchTo(v);
        v == '#play' && this.app.startNewRound();
    };
}
