'use strict';

class SimpleTemplateComponent extends HTMLElement {
    constructor(template, updateHandler, styles='', handledEvents=[]) {
        super();
        this._template = template;
        this._updateHandler = updateHandler;
        this._handledEvents = handledEvents;
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

        this._handledEvents && this._handledEvents.forEach(e => document.addEventListener(e, this));

        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        let valueChanged = oldValue !== newValue;
        let changeState = () => this._state[name] = newValue;
        valueChanged && changeState() && this.render();
    }

    handleEvent(ev) {
        this._updateHandler && this.update(this._updateHandler.call(this, ev));
    }

    static create(template, updateHandler, styles='', handledEvents=[]) {
        class DynamicComponent extends SimpleTemplateComponent {
            constructor() {
                super(template, updateHandler, styles, handledEvents);
            }

            static get observedAttributes() {
                const attributeMatches = template.match(/\${(\w+)}/g) || [];
                return attributeMatches.map(match => match.slice(2, -1));
            }
        }

        return DynamicComponent;
    }

    render() {
        const handler = {
            get(target, key) { return target[key] ?? ''; },
            has(target, key) { return true; }
        }
        const proxy = new Proxy(this._state, handler);

        const templateFunction = new Function(
            'proxy',
            `with(proxy) {
                try {
                    return \`${this._template}\`;
                } catch(e) {
                    return "";
                }
            }`
        );
        const contents = templateFunction(proxy);
        contents && (this.shadowRoot.innerHTML = contents);
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

export default function defineComponent(name, template, styles='', updateHandler=null, handledEvents=[]) {
    const ComponentClass = SimpleTemplateComponent.create(template, updateHandler, styles, handledEvents);
    customElements.define(name, ComponentClass);
    return ComponentClass;
}
