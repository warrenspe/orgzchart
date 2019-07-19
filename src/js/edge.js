import PositionMemoizer from './position_memoizer.js';

/*  Object which contains a series of nodes making up the edge of a subtree (or series of subtrees).
 *  The first node in the nodes list is the lowest in the subtree (highest level), the last is the
 *  highest in the subtree (lowest level)
 */
function Edge(posMem, nodes) {
    this.posMem = posMem;
    this.nodes = nodes;
};

/* Updates the memoized positions of the nodes that are part of the given edge by the deltaX given
 */
Edge.prototype.updateLeftPosition = function(deltaX) {
    for (var i = 0; i < this.nodes.length; i++) {
        this.posMem.offsetMap[this.nodes[i].id] += deltaX;
    }
};

/*  Adds nodes from the otherEdge which exist on a higher level than the highest level node in ourselves
 */
Edge.prototype.extendRight = function(otherEdge) {
    while (this.nodes.length < otherEdge.nodes.length) {
        this.nodes.unshift(otherEdge.nodes[otherEdge.nodes.length - (this.nodes.length + 1)]);
    }

    return this;
};

/*  Function which compares a right edge to another left edge and returns a number indicating how much space exists
 *  between their two closest nodes (positive number), or the maximum amount they overlap (negative number)
 */
Edge.prototype.compareRightWithLeftEdge = function(leftEdge) {
    var maxOverlap = 0,
        minSpaceBetween = Number.MAX_VALUE,
        rightEdgeOfLeftNode,
        leftEdgeOfRightNode,
        leftSideIdx = 0,
        rightSideIdx = 0;

    // Discard nodes which are below the lowest node on the other edge
    while (this.nodes[leftSideIdx].level > leftEdge.nodes[rightSideIdx].level) {
        leftSideIdx++;
    }
    while (this.nodes[leftSideIdx].level < leftEdge.nodes[rightSideIdx].level) {
        rightSideIdx++;
    }

    // Iterate through the remaining nodes, comparing the distances between then
    for (var idx = 0; idx < Math.min(this.nodes.length, leftEdge.nodes.length); idx++) {
        rightEdgeOfLeftNode = this.posMem.getRight(this.nodes[leftSideIdx + idx]);
        leftEdgeOfRightNode = leftEdge.posMem.getLeft(leftEdge.nodes[rightSideIdx + idx]);

        if (rightEdgeOfLeftNode > leftEdgeOfRightNode) {
            maxOverlap = Math.max(maxOverlap, rightEdgeOfLeftNode - leftEdgeOfRightNode);
        } else {
            minSpaceBetween = Math.min(minSpaceBetween, leftEdgeOfRightNode - rightEdgeOfLeftNode);
        }
    }

    return (maxOverlap > 0) ? maxOverlap : -minSpaceBetween;
};

/*  Creates both a left and right edge for the given tree.
*/
function createEdges(tree) {
    // Cache the locations of the nodes within the parent container
    var posMem = new PositionMemoizer(tree.parent),
        leftEdgeNodes = [],
        rightEdgeNodes = [],
        leaves = Array.from(tree.leaves);

    // Sort largest -> smallest by level
    leaves.sort(function(leafA, leafB) { return leafB.level - leafA.level; })

    var currentLevel = leaves[0].level,
        leftCandidate = leaves[0],
        rightCandidate = leaves[0],
        currentLeafIndex = 0;

    // Iterate over all the leaf nodes in the tree by level, finding ones on the edges of the tree
    while (currentLeafIndex < leaves.length) {
        var nextLeaf = leaves[currentLeafIndex++];

        // If the next leaf is on the next level above the last, store whatever leaves we identified for the last level
        while (currentLevel != nextLeaf.level) {
            leftEdgeNodes.push(leftCandidate);
            rightEdgeNodes.push(rightCandidate);
            // Set the current nodes to be the parents of the last nodes; if there are no leaf nodes on this new level
            // the parents of the nodes we just added will be the furthest in the direction we care about
            leftCandidate = leftCandidate.parent;
            rightCandidate = rightCandidate.parent;
            currentLevel--;
        }

        if (posMem.getLeft(nextLeaf) < posMem.getLeft(leftCandidate)) {
            leftCandidate = nextLeaf;
        }
        if (posMem.getRight(nextLeaf) > posMem.getRight(rightCandidate)) {
            rightCandidate = nextLeaf;
        }
    }

    // Add all the remaining nodes until we hit ourselves
    while (currentLevel >= tree.level) {
        leftEdgeNodes.push(leftCandidate);
        rightEdgeNodes.push(rightCandidate);
        leftCandidate = leftCandidate.parent;
        rightCandidate = rightCandidate.parent;
        currentLevel--;
    }

    return [new Edge(posMem, leftEdgeNodes), new Edge(posMem, rightEdgeNodes)];
};

export { createEdges };
