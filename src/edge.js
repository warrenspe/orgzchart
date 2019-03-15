var EDGE_RIGHT = 0,
    EDGE_LEFT = 1;

/*  Creates both a left and right edge for the given tree.
*/
function createEdges(tree) {
    var leftEdge = [],
        rightEdge = [],
        leaves = Array.from(tree.leaves);

    // Sort largest -> smallest by level
    leaves.sort(function(leafA, leafB) { return leafB.level - leafA.level; })

    var currentLevel = leaves[0].level,
        leftCandidate = leaves[0],
        leftCandidatePos = leftCandidate.getPosition(),
        rightCandidate = leaves[0],
        rightCandidatePos = rightCandidate.getPosition(),
        currentLeafIndex = 0;

    // Iterate over all the leaf nodes in the tree by level, finding ones on the edges of the tree
    while (currentLeafIndex < leaves.length) {
        var nextLeaf = leaves[currentLeafIndex++];

        // If the next leaf is on the next level above the last, store whatever leaves we identified for the last level
        while (currentLevel != nextLeaf.level) {
            leftEdge.push(leftCandidate);
            rightEdge.push(rightCandidate);
            // Set the current nodes to be the parents of the last nodes; if there are no leaf nodes on this new level
            // the parents of the nodes we just added will be the furthest in the direction we care about
            leftCandidate = leftCandidate.parent;
            leftCandidatePos = leftCandidate.getPosition();
            rightCandidate = rightCandidate.parent;
            rightCandidatePos = rightCandidate.getPosition();
            currentLevel--;
        }

        var nextLeafPos = nextLeaf.getPosition();
        if (nextLeafPos.left < leftCandidatePos.left) {
            leftCandidate = nextLeaf;
            leftCandidatePos = nextLeafPos;
        }
        if (nextLeafPos.right > rightCandidatePos.right) {
            rightCandidate = nextLeaf;
            rightCandidatePos = nextLeafPos;
        }
    }

    // Add all the remaining nodes until we hit ourselves
    while (currentLevel >= tree.level) {
        leftEdge.push(leftCandidate);
        rightEdge.push(rightCandidate);
        leftCandidate = leftCandidate.parent;
        rightCandidate = rightCandidate.parent;
        currentLevel--;
    }

    return [leftEdge, rightEdge];
};

/* Takes two right edges and creates a new edge from them, taking the righternmost nodes from each level
 */
function joinRightEdges(edgeA, edgeB) {
    var outputEdge = [],
        aIdx = 0,
        bIdx = 0;

    // Add any node which is on a level that isn't in the other edge
    while (true) {
        if (edgeA[aIdx].level > edgeB[bIdx].level) {
            outputEdge.push(edgeA[aIdx++])
        } else if (edgeB[bIdx].level > edgeA[aIdx].level) {
            outputEdge.push(edgeB[bIdx++]);
        } else {
            break;
        }
    }

    // Add the farther right of the two edges
    for (var i = 0; i < Math.min(edgeA.length, edgeB.length); i++) {
        if (edgeA[aIdx + i].getPosition().right > edgeB[bIdx + i].getPosition().right) {
            outputEdge.push(edgeA[aIdx + i]);
        } else {
            outputEdge.push(edgeB[bIdx + i]);
        }
    }

    return outputEdge;
};

/* Takes a right and left edge and returns an integer indicating how much space is between them at their closest point
 * Will return a negative number if there is overlap (of the largest amount of overlap if multiple nodes overlap)
 */
function compareEdges(leftSideRightEdge, rightSideLeftEdge) {
    var maxOverlap = 0,
        minSpaceBetween = Number.MAX_VALUE,
        rightEdgeOfLeftNode,
        leftEdgeOfRightNode,
        leftSideIdx = 0,
        rightSideIdx = 0;

    // Discard nodes which are below the lowest node on the other edge
    while (leftSideRightEdge[leftSideIdx].level > rightSideLeftEdge[rightSideIdx].level) {
        leftSideIdx++;
    }
    while (leftSideRightEdge[leftSideIdx].level < rightSideLeftEdge[rightSideIdx].level) {
        rightSideIdx++;
    }

    // Iterate through the remaining nodes, comparing the distances between then
    for (var idx = 0; idx < Math.min(leftSideRightEdge.length, rightSideLeftEdge.length); idx++) {
        rightEdgeOfLeftNode = leftSideRightEdge[leftSideIdx + idx].getPosition().right;
        leftEdgeOfRightNode = rightSideLeftEdge[rightSideIdx + idx].getPosition().left;
        if (rightEdgeOfLeftNode > leftEdgeOfRightNode) {
            maxOverlap = Math.max(maxOverlap, rightEdgeOfLeftNode - leftEdgeOfRightNode);
        } else {
            minSpaceBetween = Math.min(minSpaceBetween, leftEdgeOfRightNode - rightEdgeOfLeftNode);
        }
    }

    return (maxOverlap > 0) ? maxOverlap : -minSpaceBetween;
};

export { EDGE_RIGHT, EDGE_LEFT, createEdges, compareEdges, joinRightEdges };
