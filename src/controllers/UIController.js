export default class UIController {
    constructor(app) {
        this.app = app;
    }

    showTricks(expectedScore) {
        const dialog = this.app.root.querySelector('#tricks');
        dialog.showModal(this.app.play, expectedScore);
    }

    switchViews() {
        window.switchToView();
    };
}
