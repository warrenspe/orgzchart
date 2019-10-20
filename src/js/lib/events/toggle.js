import {showElement, hideElement} from '../utils.js';

/*  Toggles visibility of the parent of a given node
 *
 *  The `this` parameter should be set to the node whose parent is being toggled.
 */
function toggleParent() {
    if (this.hasVisibleParent()) {
        this.hideParent();
    } else {
        this.revealParent();
    }
    this.relayoutToVisibleRoot();
}

/*  Toggles visibility of the children of a given node
 *
 *  The `this` parameter should be set to the node whose children are being toggled.
 */
function toggleChildren() {
    if (this.hasVisibleChildren()) {
        this.hideChildren();
    } else {
        this.revealChildren();
    }
    this.relayoutToVisibleRoot();
}

export {toggleParent, toggleChildren};
