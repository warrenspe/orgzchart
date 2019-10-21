/*  Contains utilities for working with Tree objects
 */

import Tree from '../tree.js';
import {showElement, hideElement} from '../../utils.js';


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


/*  Sets the visible root of the graph
 */
Tree.prototype.updateRoot = function(newRoot) {
    this.chart.root = newRoot;
};


/*  Traverses up the tree from the given node until we find the visible root of the tree.
 */
Tree.prototype.getVisibleRoot = function() {
    var current = this;
    while (current.hasVisibleParent()) {
        current = current.parent;
    }
    return current;
};

/*  Returns the node which has been set as the target root of the tree.
 *  (Not necessarily the top-most node depending on visibility
 */
Tree.prototype.getRoot = function() {
    return this.chart.root;
};

Tree.prototype.revealChildren = function() {
    if (this.children.length) {
        this.children.forEach((child) => {
            child.reveal();
        });
        showElement(this.lowerBars);

        // If we were a leaf node, tell our parents that we're not anymore
        if (this.leaves.has(this)) {
            this.removeLeaf(this);
        }
    }
};

Tree.prototype.hideChildren = function() {
    if (this.children.length) {
        // Hide all children which are not the root (if a child's hide-parents arrow was clicked)
        this.children.forEach((child) => {
            if (child != this.getRoot()) {
                child.hide();
            }
        });
        hideElement(this.lowerBars);

        // If we're now a leaf node, tell our parents
        if (!this.leaves.has(this) && this.visible) {
            this.addLeaf(this);
        }
    }
};

Tree.prototype.revealParent = function() {
    // Reveal the parent node, then reveal its' children
    if (this.parent && !this.hasVisibleParent()) {
        this.parent.reveal();
        this.parent.revealChildren();
        this.updateRoot(this.parent);
    }
};

Tree.prototype.hideParent = function() {
    if (this.hasVisibleParent()) {
        // We are the new target root node
        this.updateRoot(this);
        // Find the visible root, call hide on that element to hide itself and all its descendants (except the tree root)
        this.getVisibleRoot().hide();
    }
};

Tree.prototype.hide = function() {
    if (this.visible) {
        this.visible = false;
        hideElement(this.upperBar);
        hideElement(this.lowerBars);
        hideElement(this.node);
        Object.values(this.toggles).filter((item) => item).forEach((item) => hideElement(item));
        this.hideChildren();

        // If we're now a leaf node, tell our parents
        if (this.leaves.has(this)) {
            this.removeLeaf(this);
        }
    }
};

Tree.prototype.reveal = function() {
    if (!this.visible) {
        if (this.hasVisibleParent()) {
            showElement(this.upperBar);
        }
        showElement(this.node);
        Object.values(this.toggles).filter((item) => item).forEach((item) => showElement(item));
        this.visible = true;

        if (!this.hasVisibleChildren()) {
            this.addLeaf(this);
        } else {
            showElement(this.lowerBars);
        }

        // If we haven't rendered yet, do it now
        if (!this.rendered) {
            this.render();
        }
    }
};
