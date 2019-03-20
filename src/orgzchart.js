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
                data - (Required) A string which maps to a URL to load the data from.  What is returned should be

    Inputs: containerDOM    - A dom element (typically div) to initialize the chart within.
            data            - The data to initialize the OrgzChart with (See above).
            config          - An object containing optional configuration directives: {
                nodeHeight  - The height of a child node within the chart.  Must be consistent for all nodes in the chart.
                verticalPadding - A number containing the amount of space between parent and child nodes.
                horizontalPadding - A number containing the minimum amount of space between child nodes
                createNode  - A function which when passed an object containing the data for the node to create, returns
                              an HTMLElement to render within the orgzchart.
                    The default createNode function expects the following attributes to be present in each data object:
                        name  - A string containing the name of the attribute on the object
                        title - A string containing the position title of the user identified by the object

                childrenAttr, parentAttr, nodeIdAttr - See above.
            }
    }
*/

// Have an automatic routine that checks height/width of content and updates the SVG's based on that TODO
// TODO hover node effects; maybe show route up above parent to root

import 'promise-polyfill/src/polyfill';
import './dependencies/svg.min.js';
import './dependencies/svg.foreignobject.js';

import Tree from './tree.js';
import convertData from './data_convert.js';


window.OrgzChart = (function(containerDOM, data, config) {
    var $svg,
        root;

    this.defaults = {
        childrenAttr: "children",
        nodeHeight: 40,
        verticalPadding: 35,
        horizontalPadding: 5,
        parentAttr: "parent",
        nodeIdAttr: "id",
        createNode: _defaultCreateNode
    };

    this.render = function() {
        root.render();
        this.resize();
    }.bind(this);

    /* Updates the size of the SVG to reflect its content
     */
    this.resize = function() {
        var contentBox = $svg.bbox();

        $svg.size(contentBox.w + 5, contentBox.h + 5);
    }.bind(this);

    function init() {
        if (!(containerDOM instanceof Element)) {
            throw "First parameter to OrgzChart must be a DOM element.  Got " + containerDOM + " instead";
        }

        config = _makeInternalConfig.call(this, config || {});

        convertData(data, config)
            .then((data) => {
                setupTree.call(this, data, config);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    function setupTree(data, config) {
        // Create an SVG object inside out containerDOM
        $svg = SVG(containerDOM.id)
            .size(containerDOM.getBoundingClientRect().width, containerDOM.getBoundingClientRect().height);

        root = new Tree(this, null, $svg, config, data);

        // Render ourselves in the SVG DOM
        this.render();
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

        return config;
    };

    function _defaultCreateNode(nodeData) {
        var $nodeContainer = document.createElement("div"),
            $nameContainer = document.createElement("div"),
            $titleContainer = document.createElement("div");

        // DOM layout & classes
        $nodeContainer.appendChild($nameContainer);
        $nodeContainer.appendChild($titleContainer);
        $nodeContainer.className = "node";
        $nameContainer.className = "name";
        $titleContainer.className = "title";

        // Set name/title
        $nameContainer.innerHTML = nodeData["name"] || "";
        $titleContainer.innerHTML = nodeData["title"] || "";

        // Styles
        $nodeContainer.style.border = "1px solid lightgray";
        $nodeContainer.style.borderRadius = "2px";
        $nameContainer.style.backgroundColor = "lightgray";

        $nodeContainer.style.height = "calc(100% - 2px)"

        return $nodeContainer;
    };

    init.call(this);
    return this;
}.bind({}));
