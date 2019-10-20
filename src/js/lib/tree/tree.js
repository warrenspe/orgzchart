/*  Contains the definition of a Tree object which consists of a parent node and zero or more children trees
 */

import {showElement, hideElement} from '../utils.js';

function Tree(chart, parent, parentElement, config, data) {
    this.chart = chart;
    this.parent = parent;
    this.parentElement = parentElement;
    this.config = config;
    this.data = data;
    this.children = [];
    this.leaves = new Set();
    this.visible = true;
    this.level = (parent !== null) ? parent.level + 1 : 0;
    this.toggles = {parent: null, children: null};

    // Left position relative to parent container
    this.rel_left = 0;
    // Width of the foreign object element
    this.nodeWidth = null;
    // Height of the foreign object element
    this.nodeHeight = null;
    // Left offset of the foreign object element
    this.nodeOffsetLeft = 0;

    // Container which contains the foreign element and all the child nodes
    this.container = parentElement
        .group()
        .addClass("tree-container");
    // Container which contains all the child nodes, is offset vertically in the container
    this.childContainer = this.container
        .group()
        .y(this.config.nodeHeight + config.verticalPadding)
        .addClass("child-container");
    // Bar which will be shown going up from our foreign element to our parent's lower bars
    this.upperBar = this.container.polyline()
        .stroke({width: 1})
        .fill("none");
    // Bars which will extend below our foreign element to our children's upper bars
    this.lowerBars = this.container.polyline()
        .stroke({width: 1})
        .fill("none");

    this.id = this.container.id();

    // Add children if we have them
    var children = data[config["childrenAttr"]];
    if (children && children.length) {
        this.addChildren(children);

    // Otherwise we are a leaf node. Add ourselves to our leaves dict and inform our parents of this fact
    } else {
        this.addLeaf(this);
    }

    // Render the foreign element for this node
    this.makeNode();
};


export default Tree;
