/*  Contains functions for rendering/re-rendering a node and positioning its children
 */

import * as Edges from '../edge/edge.js';
import Tree from '../tree.js';
import {showElement, hideElement} from '../../utils.js';


/*  Recursively re-renders an entire tree beneath and including the current node.
 *  Used to completely redraw a subtree.
 *  (relatively expensive)
 *
 *  Inputs: maxLevels - (Optional). An integer indicating the number of levels below the root to render
 */
Tree.prototype.recursiveRender = function(maxLevels) {
    if (typeof maxLevels !== "number" || maxLevels > 1) {
        var visibleChildren = this.getVisibleChildren();
        for (var i = 0; i < visibleChildren.length; i++) {
            visibleChildren[i].recursiveRender((typeof maxLevels == "number") ?  maxLevels - 1 : undefined);
        }
    } else {
        this.hideChildren();
    }

    if (this.visible) {
        this.render();
    }
}


/*  Recursively perform a re-layout from the given node through all of its parent nodes.
 *  Used to propogate layout changes to a subtree up the tree to the visible root.
 *  (relatively inexpensive)
 *
 *  Inputs: note - The start node to perform the relayout from.
 */
Tree.prototype.relayoutToVisibleRoot = function() {
    var current = this;
    while (current && current.visible) {
        current.render();
        current = current.parent;
    }
};


/*  Renders a node and positions its children beneath it.
 *
 *  Inputs: node - The the node to redraw.
 */
Tree.prototype.render = function() {
    if (this.visible) {
        this.rendered = true;
        this._positionChildren();
        this._renderNode();
        this._renderBars();
    }
};


Tree.prototype._positionChildren = function() {
    var visibleChildren = this.getVisibleChildren(),
        leftEdge,
        rightEdge,
        lastRightEdge,
        deltaX,
        targetX;

    if (visibleChildren.length) {
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


Tree.prototype._renderNode = function() {
    this.nodeOffsetLeft = Math.max(0, (this.width() / 2) - (this.nodeWidth / 2))
    this.node.x(this.nodeOffsetLeft);

    // Update the positions of the parent/child toggles
    if (this.toggles.parent) {
        this.toggles.parent.move(
            this.nodeOffsetLeft + (this.nodeWidth / 2) - 5,
            -10
        );
    }
    if (this.toggles.children) {
        this.toggles.children.move(
            this.nodeOffsetLeft + (this.nodeWidth / 2) - 5,
            this.nodeHeight
        );
    }
}

Tree.prototype._renderBars = function() {
    var nodeCenter = this.nodeOffsetLeft + (this.nodeWidth / 2),
        halfVerticalPadding = this.config.verticalPadding / 2;

    // Show the parent bar
    if (this.hasVisibleParent()) {
        showElement(this.upperBar);
        this.upperBar.plot([[nodeCenter, 0], [nodeCenter, -halfVerticalPadding]]);
    } else {
        hideElement(this.upperBar);
    }

    if (this.hasVisibleChildren()) {
        showElement(this.lowerBars);
        // Update the plot of the child bars so that it extends to its children
        var minChild = this.getLeftMostChild(),
            maxChild = this.getRightMostChild(),
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
        hideElement(this.lowerBars);
    }
}

