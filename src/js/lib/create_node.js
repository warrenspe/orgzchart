/*  Contains functions which create the nodes of the chart by default.
 *  These functions can be overridden to produce custom nodes by replacing the corresponding function
 *  in window.OrgzChart.prototype.functions.
 */

/* Default function which is called to create nodes for the chart.
 *
 * `this` is set to the instance of the Tree which is creating the node.
 */
function createNode(nodeData) {
    var $nodeContainer = document.createElement("div"),
        $nameContainer = document.createElement("div"),
        $titleContainer = document.createElement("div");

    // DOM layout & classes
    $nodeContainer.appendChild($titleContainer);
    $nodeContainer.appendChild($nameContainer);
    $nodeContainer.className = "default-node node";
    $titleContainer.className = "title";
    $nameContainer.className = "name";

    // Set name/title
    $titleContainer.innerHTML = nodeData["title"] || "";
    $nameContainer.innerHTML = nodeData["name"] || "";

    return $nodeContainer;
}

export {createNode};
