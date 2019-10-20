import {showElement, hideElement, relayoutToVisibleRoot} from '../utils.js';

/*  Toggles visibility of the parent of a given node
 *
 *  The `this` parameter should be set to the node whose parent is being toggled.
 */
function toggleParent() {
    // TODO
}

/*  Toggles visibility of the children of a given node
 *
 *  The `this` parameter should be set to the node whose children are being toggled.
 */
function toggleChildren() {
    // TODO - recursively re-render nodes up to visible root
    this.children.forEach(function(child) {
        child.toggleVisibility();
    }.bind(this));
    this._renderBars();
    relayoutToVisibleRoot(this);
}

export {toggleParent, toggleChildren};
