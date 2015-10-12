'use strict';

var nodes = require('./nodes');
var NodeCache = require('./node-cache');
var DOMRule = require('./rule/dom').DOMRule;

var RollingHash = function() {
    this.hash = 0;
};

RollingHash.prototype.updateWithString = function(s) {
    for (var i = 0; i < s.length; i++) {
        this.updateWithInteger(s.charCodeAt(i));
    }
};

RollingHash.prototype.updateWithInteger = function(s) {
    // 'x >>> 0' <=> ToUint32(x), see ECMA262
    this.hash = (17 * this.hash + s) >>> 0;
};

RollingHash.prototype.digest = function(s) {
    return this.hash;
};


var calcAttrHash = function(node) {
    var hasher = new RollingHash;
    var attrs = [
        node.type,
        node.literal,
        node.destination,
        node.title,
        node.info,
        node.level,
        node.type != 'List' ? null : node.listType,
        node.type != 'List' ? null : node.listTight,
        node.type != 'List' ? null : node.listStart,
        node.type != 'List' ? null : node.listDelimiter
    ];
    hasher.updateWithString(JSON.stringify(attrs));
    return node.attrHashCode = hasher.digest();
};

var calcChildrenHash = function(node) {
    var hasher = new RollingHash;
    nodes.forEachChild(node, (child) => {
        hasher.updateWithInteger(calcHash(child));
    });
    return node.childrenHashCode = hasher.digest();
};

var calcHash = function(node) {
    var hasher = new RollingHash;
    hasher.updateWithInteger(calcAttrHash(node));
    hasher.updateWithInteger(calcChildrenHash(node));
    return node.hashCode = hasher.digest();
};

var Creator = function() {
    this.tree = null;
    this.cache = new NodeCache;
    this.rule = new DOMRule;
};

Creator.prototype.create = function(node) {
    this.rule.init(node);
    this.rule.update(node);
    nodes.forEachChild(node, (child) => {
        child = this._replaceOrCreate(child);
        node.container.appendChild(child.dom);
    });
    this.rule.onChildUpdated(node);
    return node.dom;
};

Creator.prototype._replaceOrCreate = function(node) {
    if (node.hashCode != null) {
        var cached = this.cache.use(node.hashCode);
        if (cached != null) {
            node.insertBefore(cached);
            node.unlink();
            return cached;
        }
    }
    this.create(node);
    return node;
};


Creator.prototype._update = function(node1, node2) {
    if (node1.hashCode == node2.hashCode) {
        throw 'hashCode must be difference';
    }
    node2.dom = node1.dom;
    var container = node2.container = node1.container;
    if (node1.attrHashCode != node2.attrHashCode) {
        if (node1.type != node2.type
            || (node1.type == 'List'
                && node1.listType != node2.listType)
            || (node1.type == 'Header'
                && node1.level != node2.level)) {

            if (node1.parent !== null) {
                node1.parent.container.removeChild(node1.dom);
            }
            this.cache.push(node1);
            this.create(node2);
            return node2.dom;
        }
        this.rule.update(node2);
    }
    this._updateChildren(node1, node2);
    if (node1.childrenHashCode != node2.childrenHashCode) {
        this.rule.onChildUpdated(node2);
    }
    return node2.dom;
};

Creator.prototype._updateChildren = function(node1, node2) {
    var container = node2.container;
    var c1r = node1.lastChild, c2r = node2.lastChild,
        c1r_prev, c2r_prev;
    while (c1r != null && c2r != null
           && c1r.hashCode == c2r.hashCode) {
        c1r_prev = c1r.prev, c2r_prev = c2r.prev;
        c2r.insertAfter(c1r);
        c2r.unlink();
        c1r = c1r_prev, c2r = c2r_prev;
    }
    c1r = (c1r != null ? c1r.next : node1.firstChild);
    c2r = (c2r != null ? c2r.next : node2.firstChild);
    var c1l = node1.firstChild, c2l = node2.firstChild,
        c1l_next, c2l_next;
    while (c1r != c1l && c2r != c2l &&
           c1l.hashCode == c2l.hashCode) {
        c1l_next = c1l.next, c2l_next = c2l.next;
        c2l.insertBefore(c1l);
        c2l.unlink();
        c1l = c1l_next, c2l = c2l_next;
    }
    if (c1r != c1l && c2r != c2l) {
        c1r = c1r == null ? node1.lastChild : c1r.prev;
        while (c1r != c1l) {
            c1r_prev = c1r.prev;
            container.removeChild(c1r.dom);
            this.cache.push(c1r);
            c1r = c1r.prev;
        }
        this._update(c1l, c2l);
        if (c2l.dom != c1l.dom) {
            container.insertBefore(c2l.dom, c2r ? c2r.dom : null);
        }
        c2l = c2l == null ? node2.firstChild : c2l.next;
        while (c2r != c2l) {
            c2l_next = c2l.next;
            c2l = this._replaceOrCreate(c2l);
            container.insertBefore(c2l.dom, c2r ? c2r.dom : null);
            c2l = c2l_next;
        }
    } else {
        while (c2r != c2l) {
            c2l_next = c2l.next;
            c2l = this._replaceOrCreate(c2l);
            container.insertBefore(c2l.dom, c2r ? c2r.dom : null);
            c2l = c2l_next;
        }
        while (c1r != c1l) {
            c1l_next = c1l.next;
            container.removeChild(c1l.dom);
            this.cache.push(c1l);
            c1l = c1l.next;
        }
    }
};

Creator.prototype.update = function(tree) {
    if (this.tree != null && this.tree.hashCode == null) {
        calcHash(this.tree);
    }
    calcHash(tree);
    if (this.tree == null) {
        this.create(tree);
    } else if (this.tree.hashCode == tree.hashCode) {
        tree = this.tree;
    } else {
        this._update(this.tree, tree);
    }
    this.tree = tree;
    this.cache.clear();
    return this.tree.dom;
};
module.exports = Creator;
