'use strict';

var nodes = require('./nodes');

class NodeCache {
    constructor() {
        this.cache = {};
    }
    pushOne(node) {
        if (this.cache[node.hashCode] == null) {
            this.cache[node.hashCode] = [];
        }
        this.cache[node.hashCode].push(node);
    }
    useOne(hashCode) {
        if (this.cache[hashCode] == null) return null;
        return this.cache[hashCode].shift();
    }
    deleteOne(node) {
        if (this.cache[node.hashCode] == null) return false;
        var a = this.cache[node.hashCode];
        var i = a.indexOf(node);
        if (i == -1) return null;
        return a.splice(i, 1);
    }
    push(node) {
        this.pushOne(node);
        nodes.forEachChild(node, (child) => {
            this.push(child);
        });
    }
    clear() {
        this.cache = {};
    }
    delete(node) {
        this.deleteOne(node);
        if (node == null) return;
        nodes.forEachChild(node, (child) => {
            this.delete(child);
        });
    }
    use(hashCode) {
        var node = this.useOne(hashCode);
        if (node == null) return null;
        nodes.forEachChild(node, (child) => {
            this.delete(child);
        });
        var par = node.parent;
        while (par != null) {
            this.deleteOne(par);
            par = par.parent;
        }
        return node;
    }
}

module.exports = NodeCache;
