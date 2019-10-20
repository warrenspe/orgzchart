/*  Contains functions used to interact with the tree.
 */

import Tree from '../tree.js';


/*  Moves the tree within its parent's childContainer to the specified left position
 */
Tree.prototype.move = function(left) {
    this.rel_left = left;
    this.container.x(left);
};

/*  Moves the tree element within its parent's childContainer relative to its current position
 */
Tree.prototype.moveDelta = function(left) {
    this.move(left + this.rel_left);
};


/*  Adds a new leaf to this subtree (and any parents of this subtree)
*/
Tree.prototype.addLeaf = function(leaf) {
    this.leaves.add(leaf);

    if (this.parent) {
        this.parent.addLeaf(leaf);
    }
};


/*  Removes a leaf from this subtree (and any parents of this subtree)
*/
Tree.prototype.removeLeaf = function(leaf) {
    this.leaves.delete(leaf);

    if (this.parent) {
        this.parent.removeLeaf(leaf);
    }
};
