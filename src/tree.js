var EDGE_RIGHT = 0,
    EDGE_LEFT = 1;

function Tree(parent, parentElement, config, data) {
    this.parent = parent;
    this.parentElement = parentElement;
    this.config = config;
    this.data = data;
    this.children = [];
    this.leaves = new Set();
    this.visible = true;
    this.level = (parent !== null) ? parent.level + 1 : 0;

    this.container = this.parentElement
        .group()
        .addClass("tree-container");
    this.childContainer = this.container
        .group()
        .y(config.verticalPadding)
        .addClass("child-container");
    this.node = this.container
        .rect()
        .size(10, 10)
        .fill({'color': 'blue'})// TODO
        .addClass("tree-node");

    this.container.attr("name", data.name); // TODO

    var children = data[config["childrenAttr"]];
    // Add children if we have them
    if (children && children.length) {
        this.addChildren(children);

    // Otherwise we are a leaf node; inform our parents
    } else if (parent) {
        parent.addLeaf(this);
    }
};

/* Adds children of this Tree.
*/
Tree.prototype.addChildren = function(children) {
    // Create subtrees based on the children in data
    for (var i = 0; i < children.length; i++) {
        this.children.push(new Tree(this, this.childContainer, this.config, children[i]));
    }
};

/*  Returns an object detailing the position of the root node of this Tree.

    The returned object will have left and right attributes detailing the left and right positions of
    the root node relative to the outer SVG.
*/
Tree.prototype.getPosition = function() {
    var left = this.container.ctm().e + this.node.x(),
        right = left + this.node.width();

    return {left: left, right: right};
};

/* Sets this subtree to either be visible or invisible.
   If we're hiding ourselves, we also hide any subtree children of ours.
*/
Tree.prototype.setVisibility = function(visible) {
    if (visible == this.visible) {
        return;
    }

    this.visible = visible;

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].setVisibility(false);
    }

    if (this.children.length == 0 && this.parent) {
        if (visible) {
            this.parent.addLef(this);
        } else {
            this.parent.removeLeaf(this);
        }
    }
}

/* Gets the right-most child TODO do we need this or the below?
*/
Tree.prototype.getRightMostVisibleChild = function() {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].visible) {
            return this.children[i];
        }
    }
};

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

/*  Creates a listing of nodes below this subtree that form one of the edges of the tree
*/
Tree.prototype.createEdge = function(side) {
    var edge = [],
        leaves = Array.from(this.leaves),
        currentIdx = 0;

    // Sort descending by level
    leaves.sort(function(leafA, leafB) { return leafB.level - leafA.level; })

    var current = leaves[0];

    // Iterate through the leaf nodes, for each level add the one furthest in the direction we care about
    while (currentIdx < leaves.length - 1) {
        var next = leaves[currentIdx + 1];

        // If the next leaf is on the next level above us we're done processing leaves on this level
        if (next.level != current.level) {
            edge.push(current);
            // Set the current node to be this nodes parent; if there are no leaf nodes on this level, the
            // parent of the node we just added will be the furthest in the direction we care about
            current = current.parent;
            continue;
        }
        currentIdx++;

        // If this leaf node is further in the direction we care about; use it as our new current
        var currentPos = current.getPosition(),
            nextPos = next.getPosition();
        if (side == EDGE_RIGHT) {
            if (nextPos.right > currentPos.right) {
                current = next;
            } else if (nextPos.right == currentPos.right) {
                current = (current.data.name > next.data.name) ? current : next;
            }
        } else {
            if (nextPos.left < currentPos.left) {
                current = next;
            } else if (nextPos.left == currentPos.left) {
                current = (current.data.name > next.data.name) ? current : next;
            }
        }
    }

    // Add all the remaining nodes until we hit ourselves
    while (current && current.level > this.level) {
        edge.push(current);
        current = current.parent;
    }
    edge.push(this);

    return edge;
};

Tree.prototype.compareEdges = function(leftSideRightEdge, rightSideLeftEdge) {
    var maxOverlap = 0,
        minSpaceBetween = Number.MAX_VALUE,
        rightEdgeOfLeftNode,
        leftEdgeOfRightNode;

    // If either side is empty, we're done
    if (!leftSideRightEdge.length || !rightSideLeftEdge.length) {
        return;
    }
    var a = leftSideRightEdge.slice(), b = rightSideLeftEdge.slice(); // TODO
    // Discard nodes which are below the lowest node on the other edge
    while (leftSideRightEdge[0].level > rightSideLeftEdge[0].level) {
        leftSideRightEdge.shift();
    }
    while (leftSideRightEdge[0].level < rightSideLeftEdge[0].level) {
        rightSideLeftEdge.shift();
    }

    // Iterate through the remaining nodes, comparing the distances between then
    for (var idx = 0; idx < leftSideRightEdge.length; idx++) {
        rightEdgeOfLeftNode = leftSideRightEdge[idx].getPosition().right;
        leftEdgeOfRightNode = rightSideLeftEdge[idx].getPosition().left;
        if (rightEdgeOfLeftNode > leftEdgeOfRightNode) {
            maxOverlap = Math.max(maxOverlap, rightEdgeOfLeftNode - leftEdgeOfRightNode);
        } else {
            minSpaceBetween = Math.min(minSpaceBetween, leftEdgeOfRightNode - rightEdgeOfLeftNode);
        }
    }

    return (maxOverlap > 0) ? maxOverlap : -minSpaceBetween;
}

Tree.prototype.render = function() {
    // Render all of our children first so we know what sort of spacing we need
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].render();
    }

    // Align each subtree relative to each other
    for (var i = 1; i < this.children.length; i++) {
        var leftSideRightEdge = this.children[i - 1].createEdge(EDGE_RIGHT),
            rightSideLeftEdge = this.children[i].createEdge(EDGE_LEFT),
            deltaX = this.compareEdges(leftSideRightEdge, rightSideLeftEdge) + this.config.horizontalPadding,
            targetX = this.children[i].container.x() + deltaX;

        // If we've come out of the above with a targetX, instead of moving this tree left to that position,
        // move all the children to the left of this tree to the right by the same amount deltaX
        if (targetX < 0) {
            for (var j = 0 ; j < i; j++) {
                this.children[j].container.x(this.children[j].container.x() - deltaX);
            }

        // Otherwise, shift this subtree left by deltaX
        } else {
            this.children[i].container.x(targetX);
        }
    }

    // Reset our node's position
    this.node.x(0);

    // Align our root node in the center of the container
    var childContainerWidth = this.childContainer.node.getBBox().width,
        nodeWidth = this.node.width();

    this.node.x(Math.max(0, (childContainerWidth / 2) - (nodeWidth / 2)));
}


export default Tree;
