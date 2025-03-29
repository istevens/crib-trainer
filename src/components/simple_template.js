'use strict';

class SimpleTemplateComponent extends HTMLElement {
    constructor(template, updateHandler, styles='') {
        super();
        this._template = template;
        this._updateHandler = updateHandler;
        let _styles = new CSSStyleSheet()
        _styles.replaceSync(styles);
        this._state = {};
        this.attachShadow({mode: 'open'});
        this.shadowRoot.adoptedStyleSheets = [_styles];
    }

    connectedCallback() {
        Array.from(this.attributes).forEach(attr => {
            this._state[attr.name] = attr.value;
        });

        this.render();
    }

    handleEvent(ev) {
        this._updateHandler && this.update(this._updateHandler.call(this, ev));
    }

    static create(template, updateHandler, styles='') {
        class DynamicComponent extends SimpleTemplateComponent {
            constructor() {
                super(template, updateHandler, styles);
        }}
        return DynamicComponent;
    }

    render() {
        const compiledTemplate = this._template.replace(
            /\${(\w+)}/g,
            (match, key) => `\${this._state[\'${key}\']}`
        );
        const templateFunction = new Function(`return \`${compiledTemplate}\``);
        this.shadowRoot.innerHTML = templateFunction.call(this);
    }

    update(newState) {
        this._state = { ...this._state, ...newState };
        this.render();

        this.dispatchEvent(new CustomEvent('update', {
            detail: {
                state: this._state
            },
            bubbles: true,
            composed: true
        }));
    }
}

export default function defineComponent(name, template, styles='', updateHandler=null) {
    const ComponentClass = SimpleTemplateComponent.create(template, updateHandler, styles);
    customElements.define(name, ComponentClass);
    return ComponentClass;
}

