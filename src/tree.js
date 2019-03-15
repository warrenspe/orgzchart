import * as Edges from './edge.js';

function Tree(parent, parentElement, config, data) {
    this.parent = parent;
    this.parentElement = parentElement;
    this.config = config;
    this.data = data;
    this.children = [];
    this.leaves = new Set();
    this.visible = true;
    this.level = (parent !== null) ? parent.level + 1 : 0;

    this.container = this.parentElement
        .group()
        .addClass("tree-container");
    this.childContainer = this.container
        .group()
        .y(config.verticalPadding)
        .addClass("child-container");
    this.node = this.container
        .rect()
        .size(10, 10)
        .fill({'color': 'blue'})// TODO
        .addClass("tree-node");

    this.container.attr("name", data.name); // TODO

    var children = data[config["childrenAttr"]];
    // Add children if we have them
    if (children && children.length) {
        this.addChildren(children);

    // Otherwise we are a leaf node add ourselves to our leaves dict and inform our parents of this fact
    } else {
        this.addLeaf(this);
    }
};

/* Adds children of this Tree.
*/
Tree.prototype.addChildren = function(children) {
    // Create subtrees based on the children in data
    for (var i = 0; i < children.length; i++) {
        this.children.push(new Tree(this, this.childContainer, this.config, children[i]));
    }
};

/*  Returns an object detailing the position of the root node of this Tree.

    The returned object will have left and right attributes detailing the left and right positions of
    the root node relative to the outer SVG.
*/
Tree.prototype.getPosition = function() {
    var left = this.container.ctm().e + this.node.x(),
        right = left + this.node.width();

    return {left: left, right: right};
};

/* Sets this subtree to either be visible or invisible.
   If we're hiding ourselves, we also hide any subtree children of ours.
*/
Tree.prototype.setVisibility = function(visible) {
    if (visible == this.visible) {
        return;
    }

    this.visible = visible;

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].setVisibility(false);
    }

    if (this.children.length == 0 && this.parent) {
        if (visible) {
            this.parent.addLef(this);
        } else {
            this.parent.removeLeaf(this);
        }
    }
}

/* Gets the right-most child TODO do we need this or the below?
*/
Tree.prototype.getRightMostVisibleChild = function() {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].visible) {
            return this.children[i];
        }
    }
};

Tree.prototype.getLeftMostVisibleChild = function() {
    for (var i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i].visible) {
            return this.children[i];
        }
    }
};

/* Adds a new leaf to this subtree (and any parents of this subtree)
*/
Tree.prototype.addLeaf = function(leaf) {
    this.leaves.add(leaf);

    if (this.parent) {
        this.parent.addLeaf(leaf);
    }
};

/* Removes a leaf from this subtree (and any parents of this subtree)
*/
Tree.prototype.removeLeaf = function(leaf) {
    this.leaves.delete(leaf);

    if (this.parent) {
        this.parent.removeLeaf(leaf);
    }
};
Tree.prototype.render = function() {
    // Render all of our children first so we know what sort of spacing we need
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].render();
    }

    var leftEdge,
        rightEdge,
        lastRightEdge,
        deltaX,
        targetX;

    if (this.children.length) {
        [leftEdge, lastRightEdge] = Edges.createEdges(this.children[0]);
    }

    // Align each subtree relative to each other
    for (var i = 1; i < this.children.length; i++) {
        [leftEdge, rightEdge] = Edges.createEdges(this.children[i]);
        deltaX = Edges.compareEdges(lastRightEdge, leftEdge) + this.config.horizontalPadding,
        targetX = this.children[i].container.x() + deltaX;

        // If we've come out of the above with a targetX, instead of moving this tree left to that position,
        // move all the children to the left of this tree to the right by the same amount deltaX
        if (targetX < 0) {
            for (var j = 0 ; j < i; j++) {
                this.children[j].container.x(this.children[j].container.x() - deltaX);
            }

        // Otherwise, shift this subtree by deltaX
        } else {
            this.children[i].container.x(targetX);
        } // TODO handle case when we hide left most subtree and all children need to shift left, if not handled already


        lastRightEdge = Edges.joinRightEdges(lastRightEdge, rightEdge);
    }

    // Reset our node's position
    this.node.x(0);

    // Align our root node in the center of the container
    var childContainerWidth = this.childContainer.node.getBBox().width,
        nodeWidth = this.node.width();

    this.node.x(Math.max(0, (childContainerWidth / 2) - (nodeWidth / 2)));
}
// TODO we may possibly be able to return an edge up to the parent context, which would mean that we wouldn't have to find a bunch of leaf nodes every time?

export default Tree;
