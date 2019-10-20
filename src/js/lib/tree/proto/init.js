/*  Contains functions used to create the node initially
 */

import Tree from '../tree.js';
import {toggleParent, toggleChildren} from '../../events/toggle.js';


/*  Adds children of this tree.
*/
Tree.prototype.addChildren = function(childrenToMake) {
    // Create subtrees based on the children in data
    for (var i = 0; i < childrenToMake.length; i++) {
        this.children.push(new Tree(this.chart, this, this.childContainer, this.config, childrenToMake[i]));
    }

    // TODO cost algorithm for spacing out the various subtrees
};


/*  Creates a foreignobject with a nested HTML object inside for rendering the visible contents of the node
 *  Note: We create the root node in three steps; this function is the first of the three steps to minimize
 *        document reflows. This is the first of the three, where we create the elements and add them to the DOM.
 */
Tree.prototype.makeNode = function() {
    // Create a foreign object to store the node
    this.node = this.container.foreignObject();
    // Create the node to be stored in the foreign object
    this.innerNode = this.config.createNode.call(this, this.data);
    // Set the foreign object's size to 0 to force the node's scrollWidth to reflect its desired width
    this.node.size(0, 0);
    // Add the node to the foreign object
    this.node.appendChild(this.innerNode);

    // Create node toggles if we've been asked to
    if (this.config.nodeToggles) {
        if (this.parent) {
            this.toggles.parent = this.container.polygon("0,10 5,0 10,10")
                .addClass("parent-toggle")
                .on("click", toggleParent, this);
        }
        if (this.children.length) {
            this.toggles.children = this.container.polygon("0,0 5,10 10,0")
                .addClass("children-toggle")
                .on("click", toggleChildren, this);
        }
    }
};


/*  Next we measure the desired width of the node that we added, without making any changes to the DOM which
 *  would invalidate the layout and cause the next read to trigger a reflow
 */
Tree.prototype.measureNode = function() {
    this.nodeWidth = this.innerNode.scrollWidth + (this.innerNode.offsetWidth - this.innerNode.clientWidth);
    this.nodeHeight = this.innerNode.scrollHeight + (this.innerNode.offsetHeight - this.innerNode.clientHeight);
};


/*  Finally, we set all the widths of all the nodes in a row, without doing any reads that would trigger a reflow
 */
Tree.prototype.setNodeWidth = function() {
    this.node.size(this.nodeWidth, this.config.nodeHeight);
};

