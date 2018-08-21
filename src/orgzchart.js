import 'promise-polyfill/src/polyfill';

import OrgzSubTree from './orgztree.js';
import Renderer from './render.js';
import convertData from './data_convert.js';


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

    Inputs: $container - A dom element (typically div) to initialize the chart within.
            data       - The data to initialize the OrgzChart with (See above).
            config     - An object containing optional configuration directives: {
                width - TODO
                height - TODO
                childrenAttr, parentAttr, nodeIdAttr - See above.
                createNode - A function which when passed an object containing the data for the node to create, returns
                             an HTMLElement to render within the orgzchart.
                    The default createNode function expects the following attributes to be present in each data object:
                        name - A string containing the name of the attribute on the object 
                        title - A string containing the position title of the user identified by the object
            }
    }
*/

window.OrgzChart = (function($container, data, config) {
    var $svg,
        root;

    this.layout = function() {
        root.layout();
        //$svg.size(root.elements.$container.bbox().width, root.elements.$container.bbox().height); // TODO
    }.bind(this);

    function init() {
        if (!($container instanceof Element)) {
            throw `First parameter to OrgzChart must be a DOM element.  Got ${$container} instead`;
        }

        $svg = SVG($container).size(8000, 300); // TODO sizes

        config = _makeInternalConfig(config);

        convertData(data, config)
            .then((data) => {
                root = new OrgzSubTree($svg, data, config);
                this.layout();
            })
            .catch(function(error) {
                console.error(error);
            });
    }

    function _makeInternalConfig(config) {
        return {
            childrenAttr: config.childrenAttr || "children",
            parentAttr: config.parentAttr || "parent",
            nodeIdAttr: config.nodeIdAttr || "id",
            createNode: config.createNode || _defaultCreateNode,
            subTreeIdGen: function() {
                var idx = 0;
                this.next = function() {
                    return idx++;
                }
                return this;
            }.apply({}),
            subTreeMap: new Map()
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
