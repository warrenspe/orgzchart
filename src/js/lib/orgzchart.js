/*  Initializes a new OrgzChart instance.

    OrgzChart accepts data in several formats:
        1. Nested Objects:
           Inputs in config:
                data - (Required) An object representing the root of the tree, with child elements being contained
                       in an array by the name given by `childrenAttrName`.
                childrenAttr - (Optional, Default: "children").  A string containing the name of the attribute
                                   to read child nodes from.

        2. Array of objects:
            Inputs in config:
                data - (Required) An array containing objects where each object represents a node in the orgchart
                       and having the following attributes:
                       `parentAttrname` and `nodeIdAttr` (default "parent" and "id") which are described below.
                parentAttr - (Optional, Default: "parent").  A string containing the name of the attribute which
                             maps to the node's parent's `nodeIdAttr` attribute.  The root node should have this set
                             to null.
                nodeIdAttr - (Optional, Default: "id").  A string containing a unique identifier for a node, used
                             to map child nodes to parents.

        3. String:
            Inputs in config:
                data - (Required) A string which maps to a URL to load the data from.  What is returned should be in
                       one of the two formats described above.

    Inputs: containerDOM    - A dom element (typically div) to initialize the chart within.
            data            - The data to initialize the OrgzChart with (See above).
            config          - An object containing optional configuration directives: {
                nodeHeight  - The height of a child node within the chart.  Must be consistent for all nodes in the chart.
                verticalPadding - A number containing the amount of space between parent and child nodes.
                horizontalPadding - A number containing the minimum amount of space between child nodes
                createNode  - A function which when passed an object containing the data for the node to create, returns
                              an HTMLElement to render within the orgzchart.  The `this` parameter will be set to the
                              Tree instance which is creating the node.
                    The default createNode function expects the following attributes to be present in each data object:
                        name  - A string containing the name of the attribute on the object
                        title - A string containing the position title of the user identified by the object

                childrenAttr, parentAttr, nodeIdAttr - See above.
                pan - A boolean (default True) indicating whether or not the chart should be pannable.
                zoom - A boolean (default True) indicating whether or not the chart should be zoomable.
                minZoom - A number indicating the minimum scaling to apply to the chart.  Default: .01
                maxZoom - A number indicating the maximum scaling to apply to the chart.  Default: 10
                nodeToggles - A boolean (default True) indicating whether the nodes should be able to expand/hide the
                              relatives of the node
                defaultRoot - An object which if matches a node's data object will cause that node to be set as the
                              visible root of the tree on load by default.  The object should contain two keys:
                    * attrName - A string containing the name of an attribute to look for within the node objects
                    * attrValue - A value to look for on the object under the name given by `attrName`
                defaultLevels - An integer indicating the number of levels to expand by default
            }
    }
*/

// TODO hover node effects; maybe show route up above parent to root

import '../../sass/orgzchart.scss';
import 'core-js/stable';
import 'promise-polyfill/src/polyfill';
import '../dependencies/svg.min.js';
import '../dependencies/svg.foreignobject.js';


import './tree/proto/utils.js';
import './tree/proto/getters.js';
import './tree/proto/setters.js';
import './tree/proto/init.js';
import './tree/proto/render.js';
import Tree from './tree/tree.js';
import convertData from './data_convert.js';
import {enablePan, enableZoom} from './events/pan_zoom.js';
import {injectNodeToggles, createNode} from './create_node.js';


window.OrgzChart = (function(containerDOM, data, config) {
    // Defaults for configuration directives
    this.defaults = {
        childrenAttr: "children",
        nodeHeight: 60,
        verticalPadding: 35,
        horizontalPadding: 5,
        parentAttr: "parent",
        nodeIdAttr: "id",
        createNode: createNode,
        pan: true,
        zoom: true,
        minZoom: .01,
        maxZoom: 10,
        nodeToggles: true
    };
    // Internal variables which should not be used outside of this routine
    this._internal = {};

    this.$svg = null;
    this.root = null;
    this.config = null;

    this.render = function() {
        this.root.recursiveRender(this.config.defaultLevels);
        this.resize();
    }.bind(this);

    /* Updates the size of the SVG to reflect its content
     */
    this.resize = function() {
        var contentBox = this.$svg.bbox();

        this.$svg.size(contentBox.w + 5, contentBox.h + 5);
    }.bind(this);

    function init() {
        if (!(containerDOM instanceof Element)) {
            throw "First parameter to OrgzChart must be a DOM element.  Got " + containerDOM + " instead";
        }

        _makeInternalConfig.call(this, config || {});

        convertData(data, this.config)
            .then((data) => {
                setupTree.call(this, data);
                setupEvents.call(this);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    function setupTree(data) {
        // Create an SVG object inside out containerDOM
        this.$svg = SVG(containerDOM.id)
            .size(containerDOM.getBoundingClientRect().width, containerDOM.getBoundingClientRect().height);

        // Add a class to the containerDOM to signify that we've initialized in it
        containerDOM.className += ((containerDOM.className.length) ? " " : "") + "orgzchart";

        this.root = new Tree(this, null, this.$svg, this.config, data);

        // Measure the widths of all the nodes at once, then set them all at once so that the browser only reflows once
        this.root.applyToEntireSubtree(function(node) {
            node.measureNode();
        });
        this.root.applyToEntireSubtree(function(node) {
            node.setNodeWidth();
        });

        // Handle loading a particular node by default
        if (this._internal.defaultRoot) {
            this._internal.defaultRoot.hideParent();
        }

        // Render ourselves in the SVG DOM
        this.render();
    };

    function setupEvents() {
        if (this.config.pan) {
            enablePan.call(this, containerDOM, this.$svg.node);
        }
        if (this.config.zoom) {
            enableZoom.call(this, containerDOM, this.$svg.node);
        }
    };

    function _makeInternalConfig(config) {
        config = Object.assign({}, config || {}, this.defaults);

        ["verticalPadding", "horizontalPadding", "nodeHeight"].forEach((param) => {
            var val = parseFloat(config[param]);
            if (typeof val != "number" || isNaN(val)) {
                throw `${param} must be passed as a number, not ${config[param]}`;
            }
            config[param] = val;
        });

        ["childrenAttr", "parentAttr", "nodeIdAttr"].forEach((param) => {
            if (typeof config[param] != "string") {
                throw `${param} must be passed as a string, not ${config[param]}`;
            }
        });

        if (typeof config.createNode != "function") {
            throw `createNode must be passed as a function, not ${config.createNode}`;
        }

        this.config = config;
    };

    init.call(this);
    return this;
});

window.OrgzChart.prototype.functions = {
    createNode: createNode
};
