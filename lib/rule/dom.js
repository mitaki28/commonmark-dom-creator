'use strict';

var Rule = require('./').Rule;
var MappedRule = require('./').MappedRule;

class ContainerRule extends Rule {
    init(node, tagname) {
        node.dom = document.createElement(tagname);
        node.container = node.dom;
    }
}

class TextRule extends Rule {
    init(node) {
        node.dom = document.createTextNode('');
    }
    update(node) {
        node.dom.textContent = node.literal;
    }
}

class SoftbreakRule extends Rule {
    init(node) {
        node.dom = document.createTextNode('\n');
    }
}

class HardbreakRule extends Rule {
    init(node) {
        node.dom = document.createElement('br');
    }
}

class EmphRule extends ContainerRule {
    init(node) {
        super.init(node, 'em');
    }
}

class StrongRule extends ContainerRule {
    init(node) {
        super.init(node, 'strong');
    }
}

class HtmlRule extends TextRule {
    init(node) {
        node.dom = document.createTextNode('');
    }
    update(node) {
        console.warn('raw html is not supported');
        node.dom.textContent = node.literal;
    }
}

class LinkRule extends ContainerRule {
    init(node) {
        super.init(node, 'a');
    }
    update(node) {
        node.dom.setAttribute('href', node.destination);
        if (node.title) {
            node.dom.setAttribute('title', node.title);
        }
    }
}

class ImageRule extends Rule {
    init(node) {
        node.dom = document.createElement('img');
        node.container = document.createElement('p');
    }
    update(node) {
        node.dom.setAttribute('src', node.destination);
        if (node.title) {
            node.dom.setAttribute('title', node.title);
        }
    }
    onChildUpdated(node) {
        node.dom.setAttribute('alt', node.container.textContent);
    }
}

class CodeRule extends Rule {
    init(node) {
        node.dom = document.createElement('code');
    }
    update(node) {
        node.dom.textContent = node.literal;
    }
}

class DocumentRule extends ContainerRule {
    init(node) {
        super.init(node, 'div');
    }
}

class ParagraphRule extends ContainerRule {
    init(node) {
        super.init(node, 'p');
    }
}

class BlockQuoteRule extends ContainerRule {
    init(node) {
        super.init(node, 'blockquote');
    }
}

class ItemRule extends ContainerRule {
    init(node) {
        super.init(node, 'li');
    }
}

class ListRule extends ContainerRule {
    init(node) {
        super.init(node,
                           node.listType == 'Bullet' ? 'ul' : 'ol');
    }
    update(node) {
        if (node.listStart != null &&
            node.listStart != 1) {
            node.dom.setAttribute(
                'start',
                node.listStart.toString());
        }
    }
}

class HeaderRule extends ContainerRule {
    init(node) {
        super.init(node, 'h' + node.level);
    }
}

class CodeBlockRule extends Rule {
    init(node) {
        var text = document.createTextNode('');
        var code = document.createElement('code');
        var pre = document.createElement('pre');
        code.appendChild(text);
        pre.appendChild(code);
        node.dom = pre;
        node.dom._data = code;
    }
    update(node) {
        node.dom._data.textContent = node.literal;
    }
}

class HtmlBlockRule extends Rule {
    init(node) {
        node.dom = document.createElement('div');
    }
    update(node) {
        console.warn('raw html block is not supported');
        node.dom.textContent = node.literal;
    }
}

class HorizontalRuleRule extends Rule {
    init(node) {
        node.dom = document.createElement('hr');
    }
}

class DOMRule extends MappedRule {
    constructor() {
        super({
            Text: new TextRule,
            Softbreak: new SoftbreakRule,
            Hardbreak: new HardbreakRule,
            Emph: new EmphRule,
            Strong: new StrongRule,
            Html: new HtmlRule,
            Link: new LinkRule,
            Image: new ImageRule,
            Code: new CodeRule,
            Document: new DocumentRule,
            Paragraph: new ParagraphRule,
            BlockQuote: new BlockQuoteRule,
            Item: new ItemRule,
            List: new ListRule,
            Header: new HeaderRule,
            CodeBlock: new CodeBlockRule,
            HtmlBlock: new HtmlBlockRule,
            HorizontalRule: new HorizontalRuleRule
        });
    }
}

module.exports = {
    DOMRule: DOMRule,
    TextRule: TextRule,
    SoftbreakRule: SoftbreakRule,
    HardbreakRule: HardbreakRule,
    EmphRule: EmphRule,
    StrongRule: StrongRule,
    HtmlRule: HtmlRule,
    LinkRule: LinkRule,
    ImageRule: ImageRule,
    CodeRule: CodeRule,
    DocumentRule: DocumentRule,
    ParagraphRule: ParagraphRule,
    BlockQuetoRule: BlockQuoteRule,
    ItemRule: ItemRule,
    ListRule: ListRule,
    HeaderRule: HeaderRule,
    CodeBlockRule: CodeBlockRule,
    HtmlBlockRule: HtmlBlockRule,
    HorizontalRuleRule: HorizontalRuleRule
};
