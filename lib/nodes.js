var next = function(node) {
    return node ? node.next : null;
};
var forEachChild = function(node, f) {
    for (var child = node.firstChild,
             next = this.next(child);
         child !== null;
         child = next, next = this.next(child)) {
        f(child);
    }
};

module.exports = {
    next: next,
    forEachChild: forEachChild
};
