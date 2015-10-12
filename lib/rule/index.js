'use strict';

class Rule {
    update(node) {}
    onChildUpdated(node) {}
}

class MappedRule extends Rule {
    constructor(map) {
        super();
        this.map = map;
    }
    init(node) {
       return this.map[node.type].init(node);
    }
    update(node) {
        return this.map[node.type].update(node);
    }
    onChildUpdated(node) {
        return this.map[node.type].onChildUpdated(node);
    }
}

module.exports = {
    Rule: Rule,
    MappedRule: MappedRule
};
