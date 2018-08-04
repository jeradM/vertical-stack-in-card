const styles = `
  :host {
    background: #FFF;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.15);
    padding-bottom: 16px;
  }

  .header {
    -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
    font-family: var(--paper-font-headline_-_font-family);
    font-size: var(--paper-font-headline_-_font-size);
    font-weight: var(--paper-font-headline_-_font-weight);
    letter-spacing: var(--paper-font-headline_-_letter-spacing);
    line-height: var(--paper-font-headline_-_line-height);
    opacity: var(--dark-primary-opacity);
    padding: 24px 16px 0px 16px;
    text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
  }
`;
class VerticalStackInCard extends HTMLElement {
    constructor() {
        super();
        this._items = 0;
        // Make use of shadowRoot to avoid conflicts when reusing
        this.attachShadow({ mode: 'open' });
    }
    setConfig(config) {
        if (!config || !config.cards || !Array.isArray(config.cards)) {
            throw new Error('Card config incorrect');
        }

        const root = this.shadowRoot;
        while (root.lastChild) {
            root.removeChild(root.lastChild);
        }

        const style = document.createElement('style');
        style.appendChild(document.createTextNode(styles));
        root.appendChild(style);

        const cardConfig = Object.assign({}, config);
        this._refCards = [];
        if (config.title) {
            const title = document.createElement("div");
            title.className = "header";
            title.innerHTML = '<div class="name">' + config.title + '</div>';
            root.appendChild(title);
        }
        let element;
        config.cards.forEach(item => {
            if (item.type.startsWith("custom:")){
                element = document.createElement(`${item.type.substr("custom:".length)}`);
            } else {
                element = document.createElement(`hui-${item.type}-card`);
            }
            element.setConfig(item);
            root.appendChild(element);
            this._refCards.push(element);
        });
        this._config = cardConfig;
    }

    connectedCallback() {
        const config = this._config;
        const root = this.shadowRoot;
        const hass = this.hass;
        let index = 1;
        if (config.title) {
            index++;
        }
        config.cards.forEach(item => {
            root.childNodes[index].hass = hass;
            if (root.childNodes[index].shadowRoot) {
                if (!root.childNodes[index].shadowRoot.querySelector('ha-card')) {
                    var searchEles = root.childNodes[index].shadowRoot.getElementById("root").childNodes;
                    for(var i = 0; i < searchEles.length; i++) {
                        searchEles[i].style.margin = "0px";
                        searchEles[i].shadowRoot.querySelector('ha-card').style.boxShadow = 'none';
                        searchEles[i].shadowRoot.querySelector('ha-card').style.paddingBottom = '0px';
                    }
                } else {
                    root.childNodes[index].shadowRoot.querySelector('ha-card').style.boxShadow = 'none';
                    root.childNodes[index].shadowRoot.querySelector('ha-card').style.paddingBottom = '0px';
                    if(index > 0 && !config.title) {
                        root.childNodes[index].shadowRoot.querySelector('ha-card').style.paddingTop = '0px';
                    }
                }
            }
            index++;
        })
    }

    diconnectedCallback() {
      const root = this.shadowRoot;
      if (!root) return;
      while (root.lastChild) {
        root.removeChild(root.lastChild);
      }
    }

    getCardSize() {
        let totalSize = 0;
        this._refCards.forEach((element) => {
            totalSize += typeof element.getCardSize === 'function' ? element.getCardSize() : 1;
        });
        return totalSize;
    }
}
customElements.define('vertical-stack-in-card', VerticalStackInCard);
