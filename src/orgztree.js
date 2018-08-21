var OrgzSubTree = (function($parent, datum, config) {
    this.treeId = config.subTreeIdGen.next();
    this.datum = datum // TODO
    config.subTreeMap.set(this.treeId, this);

    var children = [],
        elements;

    /*  Returns an array containing the child subtrees which are children of this subtree.
     */
    this.getChildren = function() {
        return children.slice();
    }.bind(this);

    /*  Returns the root node DOM element for this subtree.
     */
    this.getRoot = function() {
        return elements.$root;
    }

    this.layout = function() {
        var rootDimensions = _getRootDimensions();

        // Layout each of our child trees
        children.forEach((tree) => tree.layout());

        // Position the children trees below the root
        elements.$childrenContainer.y(rootDimensions.height + 5); // TODO config this offset

        // Position each subtree relative to each other
        for (var i = 1; i < children.length; i++) {
            children[i].positionToRightOf(children[i - 1]);
        }

        // Layout/position the root
        elements.$foreignObject.size(rootDimensions.width, rootDimensions.height);
        elements.$rootContainer.x((elements.$container.bbox().width / 2) - (rootDimensions.width / 2));
    }.bind(this);

    /*  Positions this subtree to the right of the given subtree.

        Inputs: subTree - An instance of OrgzSubTree to position ourselves adjacent to.
     */
    this.positionToRightOf = function(subTree) {
        console.log("left", subTree.datum.name, "right", this.datum.name);
        // Find the righternmost child of the given subtree and the lefternmost child of this subtree
        // to the furthest shared level
        var currentLeft,
            nextLeft = subTree,
            currentRight,
            nextRight = this;
        do {
            currentLeft = nextLeft;
            nextLeft = currentLeft.getChildren().slice(-1)[0];
            currentRight = nextRight;
            nextRight = currentRight.getChildren().slice(0)[0];
        } while (nextLeft !== undefined && nextRight !== undefined);

        var rightMostLeftChild = currentLeft.getRoot(),
            leftMostRightChild = currentRight.getRoot();

        // Calculate the offset for this subTree that prevents overlapping
        var rightRect = rightMostLeftChild.getBoundingClientRect(),
            rightX = rightRect.x + rightRect.width;
        elements.$container.x(rightX + 5);
    }.bind(this);

    function _init() {
        // Initialize the various components for this subtree
        var $container = $parent.group(),
            $rootContainer = $container.group(),
            $childrenContainer = $container.group(),
            $foreignObject = $rootContainer.foreignObject(),
            $root = config.createNode(datum);

        $foreignObject.appendChild($root);
        $container.addClass("subtree-container");
        $rootContainer.addClass("root-container");
        $childrenContainer.addClass("children-container");
        $foreignObject.addClass("element-container");

        elements = {
            $container,
            $rootContainer,
            $root,
            $foreignObject,
            $childrenContainer
        };

        // Initialize our children subtrees
        for (var i = 0; i < datum.children.length; i++) {
            children.push(new OrgzSubTree(
                elements.$childrenContainer,
                datum.children[i],
                config
            ));
        }
    }

    function _getRootDimensions() {
        // Enlarge the container elements dimensions to ludicrus proportions
        var original = {
            parentHeight: elements.$rootContainer.height(),
            parentWidth: elements.$rootContainer.width()
        };
        elements.$rootContainer.height(5000);
        elements.$rootContainer.width(5000);

        // Get dimensions of the (hopefully) unconstrained root
        var width = elements.$root.offsetWidth,
            height = elements.$root.offsetHeight;

        // Revert parent dimensions
        elements.$rootContainer.height(original.parentHeight);
        elements.$rootContainer.width(original.parentWidth);

        return {width, height};
    }

    _init.call(this);
    return this;
}.bind({}));

export default OrgzSubTree;
