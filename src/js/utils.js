import Promise from 'promise-polyfill';

/*  Performs an AJAX request to fetch a resource
 */
function fetchAjax(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function() {
        try {
            resolve(JSON.parse(xhr.responseText));
        } catch(exc) {
            reject(exc);
        }
    };
    xhr.onerror = function() {
        reject(xhr.statusText);
    };

    xhr.send();
  });
}


/*  Recursively re-renders an entire tree beneath and including a given root node
 *  Used to completely redraw a subtree.
 *  (relatively expensive)
 *
 *  Inputs: node - The the node to redraw.
 */
function renderTree(node) {
    var visibleChildren = node.getVisibleChildren();
    for (var i = 0; i < visibleChildren.length; i++) {
        renderTree(visibleChildren[i]);
    }
    node.render();
}


/*  Recursively perform a re-layout from the given node through all of its parent nodes.
 *  Used to propogate layout changes to a subtree up the tree to the visible root.
 *  (relatively inexpensive)
 *
 *  Inputs: note - The start node to perform the relayout from.
 */
function relayoutToVisibleRoot(node) {
    var current = node;
    while (current && current.visible) {
        current._positionChildren();
        current = current.parent;
    }
}


/*  Functions for showing/hiding SVG elements
 */
function showElement(element) {
    element.style("visibility", "visible");
}
function hideElement(element) {
    element.style("visibility", "collapse");
}

export { fetchAjax, showElement, hideElement, renderTree, relayoutToVisibleRoot };
