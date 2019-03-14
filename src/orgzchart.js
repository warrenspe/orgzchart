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
                createNode  - A function which when passed an object containing the data for the node to create, returns
                              an HTMLElement to render within the orgzchart.
                    The default createNode function expects the following attributes to be present in each data object:
                        name  - A string containing the name of the attribute on the object
                        title - A string containing the position title of the user identified by the object

                childrenAttr, parentAttr, nodeIdAttr - See above.
            }
    }
*/

import 'promise-polyfill/src/polyfill';
import './dependencies/svg.min.js';
import './dependencies/svg.foreignobject.js';

//import Renderer from './render.js'; // TODO
import Tree from './tree.js';
import convertData from './data_convert.js';


window.OrgzChart = (function(containerDOM, data, config) {
    var $svg,
        root;

    function setupTree(data, config) {
        // Create an SVG object inside out containerDOM
        $svg = SVG(containerDOM.id)
            .size(containerDOM.getBoundingClientRect().width, containerDOM.getBoundingClientRect().height);

        root = new Tree(null, $svg, config, data);

        // Render ourselves in the SVG DOM
        root.render();

        // TODO testing
        this.$svg = $svg
        this.root = root;
    }

    function init() {
        if (!(containerDOM instanceof Element)) {
            throw "First parameter to OrgzChart must be a DOM element.  Got " + containerDOM + " instead";
        }

        config = _makeInternalConfig(config || {});

        convertData(data, config)
            .then((data) => {
                setupTree.call(this, data, config);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function _makeInternalConfig(config) {
        return {
            childrenAttr: config.childrenAttr || "children",
            nodeHeight: config.nodeHeight || 100,
            verticalPadding: parseInt(config.verticalPadding || 15), // TODO doc
            horizontalPadding: parseInt(config.HorizontalPadding || 5), // TODO doc
            parentAttr: config.parentAttr || "parent",
            nodeIdAttr: config.nodeIdAttr || "id",
            createNode: config.createNode || _defaultCreateNode,
            subTreeIdGen: function() {
                var idx = 0;
                this.next = function() {
                    return idx++;
                }
                return this;
            }.apply({})
        };
    }

    function _defaultCreateNode(nodeData) {
        var $nodeContainer = document.createElement("div"),
            $nameContainer = document.createElement("div"),
            $titleContainer = document.createElement("div");

        $nodeContainer.appendChild($nameContainer);
        $nodeContainer.appendChild($titleContainer);
        $nodeContainer.className = "node";
        $nameContainer.innerHTML = nodeData["name"] || "";
        $titleContainer.innerHTML = nodeData["title"] || "";

        return $nodeContainer;
    }

    init.call(this);
    return this;
}.bind({}));
