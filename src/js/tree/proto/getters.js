/*  Contains functions for retrieving attributes from trees.
 */

import Tree from '../tree.js';


/*  Calculates the width of this tree (or more specifically, of all its children
 */
Tree.prototype.width = function() {
    // Calculate the element which is furthest to the right within this group
    var maxRight = 0,
        minLeft = 0;

    if (this.hasVisibleChildren()) {
        for (var i = 0; i < this.children.length; i++) {
            maxRight = Math.max(maxRight, this.children[i].rel_left + this.children[i].width());
            minLeft = Math.min(minLeft, this.children[i].rel_left);
        }
    }

    return Math.max(minLeft + maxRight, this.nodeWidth);
};


/*  Returns a boolean indicating whether the current node has any visible children or not.
 */
Tree.prototype.hasVisibleChildren = function() {
    return this.children.length && this.children[0].visible;
};


/*  Returns a boolean indicating whether the current node has a visible parent or not.
 */
Tree.prototype.hasVisibleParent = function() {
    return this.parent && this.parent.visible;
};


/*  Returns an array of all the children of this subtree which are visible
 */
Tree.prototype.getVisibleChildren = function() {
    if (this.hasVisibleChildren()) {
        return this.children;
    }
    return [];
};


/*  Gets the right-most visible child of this subtree
*/
Tree.prototype.getRightMostChild = function() {
    return this.children[this.children.length - 1];
};


/*  Gets the left-most visible child of this subtree
*/
Tree.prototype.getLeftMostChild = function() {
    return this.children[0];
};

