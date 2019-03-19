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
        .y(this.config.nodeHeight + config.verticalPadding)
        .addClass("child-container");
    this.upperBar = this.container.polyline()
        .stroke({width: 1}) // TODO
        .fill("none");
    this.lowerBars = this.container.polyline()
        .stroke({width: 1}) // TODO
        .fill("none");

    this.makeNode();

    // Add children if we have them
    var children = data[config["childrenAttr"]];
    if (children && children.length) {
        this.addChildren(children);

    // Otherwise we are a leaf node. Add ourselves to our leaves dict and inform our parents of this fact
    } else {
        this.addLeaf(this);
    }
};

/* Creates a foreignobject with a nested HTML object inside for rendering the visible contents of the node
 */
Tree.prototype.makeNode = function() {
    this.node = this.container.foreignObject();
    this.innerNode = this.config.createNode(this.data);
    this.node.appendChild(this.innerNode);
    this.node.size(this.getTextWidth(this.data.name) + 2, this.config.nodeHeight);

    /*(this.node = this.container
        .rect()
        .size(10, 10) //TODO
        .fill({'color': 'blue'})// TODO
        .addClass("tree-node");*/
};

/*
   Uses canvas.measureText to compute and return the width of the given text of given font in pixels.

   https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
*/
Tree.prototype.getTextWidth = function(text) {
    var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas")),
        context = canvas.getContext("2d");
    context.font = window.getComputedStyle( this.innerNode, null ).getPropertyValue("font");
    return context.measureText(text).width;
}

/* Adds children of this Tree.
*/
Tree.prototype.addChildren = function(childrenToMake) {
    // Create subtrees based on the children in data
    for (var i = 0; i < childrenToMake.length; i++) {
        this.children.push(new Tree(this, this.childContainer, this.config, childrenToMake[i]));
    }

    // TODO cost algorithm for spacing out the various subtrees
};

/*  Returns an object detailing the position of the root node of this Tree.

    The returned object will have left and right attributes detailing the left and right positions of
    the root node relative to the outer SVG.
*/
Tree.prototype.getPosition = function() {
    var left = this.container.ctm().e + this.node.x(),
        right = left + this.node.bbox().w;

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

/* Renders the subtree, its children, and the bars above its node (from its parent)
 */
Tree.prototype.render = function() {
    this.renderChildren();
    this.renderNode();
    this.renderBars();
};

Tree.prototype.renderChildren = function() {
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

        // Align each subtree relative to each other
        for (var i = 1; i < this.children.length; i++) {
            [leftEdge, rightEdge] = Edges.createEdges(this.children[i]);
            deltaX = Edges.compareEdges(lastRightEdge, leftEdge) + this.config.horizontalPadding;

            if (deltaX) {
                this.children[i].container.x(this.children[i].container.x() + deltaX);
            }

            lastRightEdge = Edges.joinRightEdges(lastRightEdge, rightEdge);
        }

        // Now that we've oriented all our children relative to each other, iterate through them again, to ensure that the
        // left edge of subtree with the leftmost node is positioned at x-index 0 (relative to our container)
        var lowestX = this.children[0].container.x();
        for (var i = 1; i < this.children.length; i++) {
            lowestX = Math.min(this.children[i].container.x(), lowestX);
        }
        // If it's not at 0, we need to position everyone so that it is
        if (lowestX != 0) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].container.x(this.children[i].container.x() - lowestX);
            }
        }
    }
}

Tree.prototype.renderNode = function() {

    // Reset our node's position
    this.node.x(0);

    // Align our root node in the center of the container
    var childContainerWidth = this.childContainer.node.getBBox().width,
        nodeWidth = this.node.width();

    this.node.x(Math.max(0, (childContainerWidth / 2) - (nodeWidth / 2)));
}

Tree.prototype.renderBars = function() {
    var nodeBox = this.node.bbox(),
        nodeCenter = nodeBox.x + (nodeBox.w / 2),
        halfVerticalPadding = this.config.verticalPadding / 2;

    // Show the parent bar
    if (this.parent) {
        this.upperBar.style("visibility", "visible");
        this.upperBar.plot([[nodeCenter, 0], [nodeCenter, -halfVerticalPadding]]);
    } else {
        this.upperBar.style("visibility", "collapse");
    }

    if (this.children.some((child) => child.visible)) {
        this.lowerBars.style("visibility", "visible");
        // Update the plot of the child bars so that it extends to its children
        var minChild = this.children[0],
            maxChild = this.children[this.children.length - 1],
            minChildBox = minChild.node.bbox(),
            maxChildBox = maxChild.node.bbox(),
            minContainerX = minChild.container.x(),
            maxContainerX = maxChild.container.x();

        this.lowerBars.plot([
            // Start at bottom middle of node
            [nodeCenter, nodeBox.h],
            // Draw straight down to half vertical padding
            [nodeCenter, halfVerticalPadding + nodeBox.h],
            // Cut left to middle of far left child position
            [minContainerX + minChildBox.x + (minChildBox.w / 2), halfVerticalPadding + nodeBox.h],
            // Cut right to middle of far right child position
            [maxContainerX + maxChildBox.x + (maxChildBox.w / 2), halfVerticalPadding + nodeBox.h]
        ]);
    } else {
        this.lowerBars.style("visibility", "collapse");
    }
}

// TODO we may possibly be able to return an edge up to the parent context, which would mean that we wouldn't have to find a bunch of leaf nodes every time?

export default Tree;
