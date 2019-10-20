/*  Contains utilities for working with Tree objects
 */

import Tree from '../tree.js';


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
