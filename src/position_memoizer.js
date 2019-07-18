/* An object which records the positions of nodes that exist as children of a root node, relative
 * to that root node in order to speed up position lookups.
 */
function PositionMemoizer(root) {
    this.offsetMap = {};
    this.offsetMap[root.id] = 0;
};

/*  Gets a node's containers offset relative to the root node.
 */
PositionMemoizer.prototype.getOffset = function(node) {
    if (!this.offsetMap.hasOwnProperty(node.id)) {
        this.offsetMap[node.id] = this.getOffset(node.parent) + node.rel_left;
    }

    return this.offsetMap[node.id];
};

/*  Returns a number specifying how far left the given child node (foreign object) is compared to the
 *  root node that we were initialized with.
 */
PositionMemoizer.prototype.getLeft = function(node) {
    return this.getOffset(node) + node.nodeOffsetLeft;
};

/*  Returns a number specifying how far right the given child is compared to the root node that we were
 *  initialized with
 */
PositionMemoizer.prototype.getRight = function(node) {
    return this.getLeft(node) + node.nodeWidth;
};

export default PositionMemoizer;
