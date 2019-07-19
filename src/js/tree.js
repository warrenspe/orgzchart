import * as Edges from './edge.js';

function Tree(chart, parent, parentElement, config, data) {
    this.chart = chart;
    this.parent = parent;
    this.parentElement = parentElement;
    this.config = config;
    this.data = data;
    this.children = [];
    this.leaves = new Set();
    this.visible = true;
    this.level = (parent !== null) ? parent.level + 1 : 0;

    // Left position relative to parent container
    this.rel_left = 0;
    // Width of the foreign object element
    this.nodeWidth = null;
    // Height of the foreign object element
    this.nodeHeight = null;
    // Left offset of the foreign object element
    this.nodeOffsetLeft = 0;

    // Container which contains the foreign element and all the child nodes
    this.container = parentElement
        .group()
        .addClass("tree-container");
    // Container which contains all the child nodes, is offset vertically in the container
    this.childContainer = this.container
        .group()
        .y(this.config.nodeHeight + config.verticalPadding)
        .addClass("child-container");
    // Bar which will be shown going up from our foreign element to our parent's lower bars
    this.upperBar = this.container.polyline()
        .stroke({width: 1})
        .fill("none");
    // Bars which will extend below our foreign element to our children's upper bars
    this.lowerBars = this.container.polyline()
        .stroke({width: 1})
        .fill("none");

    this.id = this.container.id();

    // Render the foreign element for this node
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

/*  Applies a function to this node and all of children below this node
 */
Tree.prototype.applyToEntireSubtree = function(func) {
    var toRun = [this],
        currentIdx = 0;

    while (currentIdx < toRun.length) {
        var current = toRun[currentIdx++];
        func(current);
        Array.prototype.push.apply(toRun, current.children);
    }
};

/*  Moves the tree within its parent's childContainer to the specified left position
 */
Tree.prototype.move = function(left) {
    this.rel_left = left;
    this.container.x(left);
};

/* Moves the tree element within its parent's childContainer relative to its current position
 */
Tree.prototype.moveDelta = function(left) {
    this.move(left + this.rel_left);
};

/* Calculates the width of this tree (or more specifically, of all its children
 */
Tree.prototype.width = function() {
    // Calculate the element which is furthest to the right within this group
    var maxRight = 0,
        minLeft = 0;

    for (var i = 0; i < this.children.length; i++) {
        maxRight = Math.max(maxRight, this.children[i].rel_left + this.children[i].width());
        minLeft = Math.min(minLeft, this.children[i].rel_left);
    }

    return Math.max(minLeft + maxRight, this.nodeWidth);
};


/* Creates a foreignobject with a nested HTML object inside for rendering the visible contents of the node
 * Note: We create the root node in three steps; this function is the first of the three steps to minimize
 *       document reflows. This is the first of the three, where we create the elements and add them to the DOM.
 */
Tree.prototype.makeNode = function() {
    // Create a foreign object to store the node
    this.node = this.container.foreignObject();
    // Create the node to be stored in the foreign object
    this.innerNode = this.config.createNode(this.data);
    // Set the foreign object's size to 0 to force the node's scrollWidth to reflect its desired width
    this.node.size(0, 0);
    // Add the node to the foreign object
    this.node.appendChild(this.innerNode);
};
/* Next we measure the desired width of the node that we added, without making any changes to the DOM which
 * would invalidate the layout and cause the next read to trigger a reflow
 */
Tree.prototype.measureNode = function() {
    // Store the target width on the node object for lack of a better place
    this.nodeWidth = this.innerNode.scrollWidth + (this.innerNode.offsetWidth - this.innerNode.clientWidth);
    this.nodeHeight = this.innerNode.scrollHeight + (this.innerNode.offsetHeight - this.innerNode.clientHeight);
};
/* Finally, we set all the widths of all the nodes in a row, without doing any reads that would trigger a reflow
 */
Tree.prototype.setNodeWidth = function() {
    this.node.size(this.nodeWidth, this.config.nodeHeight);
};

/* Adds children of this Tree.
*/
Tree.prototype.addChildren = function(childrenToMake) {
    // Create subtrees based on the children in data
    for (var i = 0; i < childrenToMake.length; i++) {
        this.children.push(new Tree(this.chart, this, this.childContainer, this.config, childrenToMake[i]));
    }

    // TODO cost algorithm for spacing out the various subtrees
};

/* Sets this subtree to either be visible or invisible.
   If we're hiding ourselves, we also hide any subtree children of ours.
*/
Tree.prototype.setVisibility = function(visible) {
    if (visible == this.visible) {
        return;
    }

    this.visible = visible;

    if (!visible) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].setVisibility(false);
        }
        this.container.style("visibility", "collapse");
    } else {
        this.container.style("visibility", "visible");
    }

    if (this.children.length == 0 && this.parent) {
        if (visible) {
            this.parent.addLef(this);
        } else {
            this.parent.removeLeaf(this);
        }
    }
}

/* Returns an array of all the children of this subtree which are visible
 */
Tree.prototype.getVisibleChildren = function() {
    return this.children.filter((child) => child.visible);
};

/* Gets the right-most visible child of this subtree
*/
Tree.prototype.getRightMostVisibleChild = function() {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].visible) {
            return this.children[i];
        }
    }
};

/* Gets the left-most visible child of this subtree
*/
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
    if (this.visible) {
        this.renderChildren();
        this.renderNode();
        this.renderBars();
    }
};

Tree.prototype.renderChildren = function() {
    var visibleChildren = this.getVisibleChildren(),
        leftEdge,
        rightEdge,
        lastRightEdge,
        deltaX,
        targetX;

    if (visibleChildren.length) {
        // Render all of our children first so we know what sort of spacing we need
        for (var i = 0; i < visibleChildren.length; i++) {
            visibleChildren[i].render();
        }

        // Space out the children so that they're compact but not overlapping
        [leftEdge, lastRightEdge] = Edges.createEdges(visibleChildren[0]);

        // Align each subtree relative to each other
        for (var i = 1; i < visibleChildren.length; i++) {
            [leftEdge, rightEdge] = Edges.createEdges(visibleChildren[i]);
            deltaX = lastRightEdge.compareRightWithLeftEdge(leftEdge) + this.config.horizontalPadding;

            if (deltaX) {
                visibleChildren[i].moveDelta(deltaX);
                rightEdge.updateLeftPosition(deltaX);
            }

            lastRightEdge = rightEdge.extendRight(lastRightEdge);
        }

        // Now that we've oriented all our children relative to each other, iterate through them again, to ensure that the
        // left edge of subtree with the leftmost node is positioned at x-index 0 (relative to our container)
        var lowestX = visibleChildren[0].rel_left;
        for (var i = 1; i < visibleChildren.length; i++) {
            lowestX = Math.min(visibleChildren[i].rel_left, lowestX);
        }
        // If it's not at 0, we need to position everyone so that it is
        if (lowestX != 0) {
            for (var i = 0; i < visibleChildren.length; i++) {
                visibleChildren[i].moveDelta(-lowestX);
            }
        }
    }
}

Tree.prototype.renderNode = function() {
    this.nodeOffsetLeft = Math.max(0, (this.width() / 2) - (this.nodeWidth / 2))
    this.node.x(this.nodeOffsetLeft);
}

Tree.prototype.renderBars = function() {
    var nodeCenter = this.nodeOffsetLeft + (this.nodeWidth / 2),
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
        var minChild = this.getLeftMostVisibleChild(),
            maxChild = this.getRightMostVisibleChild(),
            minContainerX = minChild.rel_left + minChild.nodeOffsetLeft + (minChild.nodeWidth / 2),
            maxContainerX = maxChild.rel_left + maxChild.nodeOffsetLeft + (maxChild.nodeWidth / 2);

        this.lowerBars.plot([
            // Start at bottom middle of node
            [nodeCenter, this.nodeHeight],
            // Draw straight down to half vertical padding
            [nodeCenter, halfVerticalPadding + this.config.nodeHeight],
            // Cut left to middle of far left child position
            [minContainerX, halfVerticalPadding + this.config.nodeHeight],
            // Cut right to middle of far right child position
            [maxContainerX, halfVerticalPadding + this.config.nodeHeight]
        ]);
    } else {
        this.lowerBars.style("visibility", "collapse");
    }
}

export default Tree;
