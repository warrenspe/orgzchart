export default class Renderer {
    constructor($container, orgztree, data) {
        this.$container = $container;
        this.orgztree = orgztree;
        this.lastrendered = {};

        this.scale = 1;
        this.translate = {
            x: 0,
            y: 0
        };
    }

    render() {
        this.drawSubtree(this.orgztree.root);
    }

    drawSubtree($parentG, subtree) {
        var $newG = $parentG.group(),
            $root = $
            $node = $parentG.foreignObject(),
            children = this.orgztree.children(subtree);

        for (var i = 0; i < children.length; i++) {
            this.drawSubtree(children[i]);
        }
    }

    scale(scale) {
        this.scale = scale;
        this._setTransform();
    }

    pan(x, y) {
        this.translate.x = x;
        this.translate.y = y;
        this._setTransform();
    }

    getNodeDimensions($node) {
        // Display the element whilst invisible to determine its size
        var original = {
            display: $node.style.display,
            visibility: $node.style.visibility,
            position: $node.style.position
        };
        $node.position = "absolute";
        $node.visibility = "hidden";
        $node.display = "block";
        this.$container.parentNode.insertBefore($node, this.$container);;

        // Get dimensions
        var width = $node.offsetWidth,
            height = $node.offsetHeight;

        // Remove from DOM, Revert styles
        $node.parentNode.removeChild($node);
        $node.display = original.display;
        $node.visibility = original.visibility;
        $node.position = original.position;

        return {width: width, height: height};
    }

    _setTransform() {
        var scale = `scale(${this.scale})`,
            translateX = `${this.translate.x}px`,
            translateY = `${this.translate.y}px`,
            translate = `translate(${translateX}, ${translateY})`;

        this.svg.node.style.transform = `${scale} ${translate}`;
    }
}
