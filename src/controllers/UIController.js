export default class UIController {
    constructor(app) {
        this.app = app;
    }

    openDialog(d) {
        d = this.app.root.querySelector(`[role=dialog]#${d}`);
        d.showModal();
    }

    showTricks(expectedScore) {
        const dialog = this.app.root.querySelector('#tricks');
        dialog.showModal(this.app.play, expectedScore);
    }

    switchSections() {
        var location = window.location.hash.replace('#', '');
        location = location || 'start';
        var sections = ['.activeContent', '#' + location];
        sections.map(x => {
            this.app.root.querySelector(x)?.classList.toggle('activeContent');
        });
        location == 'play' && this.app.startNewRound();
    };
}
