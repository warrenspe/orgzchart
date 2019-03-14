/*  Contains functions which do the grunt work of converting data to the required nested Object format.

    All functions have the following input/output definitions:
        Inputs: config - An object containing properties needed by the particular data conversion function used.

        Outputs: A Promise which resolves containing the nested Object format, or rejects with an error message.
*/

// TODO service workerify this stuff?
import * as Utils from './utils.js';


/*  Accepts all supported formats of data, and converts them into format 1 (Nested Objects).
    See orgzchart.js for more information regarding accepted input types.

    Inputs: data   - The object/string/array/etc containing the data to convert to nested object form.
            config - Configuration to use while parsing the input data

    Outputs: A promise which resolves when the data has been converted.
*/
function convertData(data, config) {
    switch (data.constructor) {
        case(String):
            return convertString(data, config);

        case(Array):
            return convertArray(data, config);

        case(Object):
            return convertObject(data, config);

        default:
            return new Promise.reject("Unknown data input type.");
    }
}

/*  Fetches the data via AJAX, then passes it to the convert function to ensure it is returned in the correct format.
    (it is valid to serve, say, Array data via ajax).
*/
function convertString(data, config) {
    return new Promise((resolve, reject) => {
        Utils.fetchAjax(data)
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/*  Converts the data from an array of objects into a nensted Object format.
*/
function convertArray(data, config) {
    var parentAttr = config.parentAttr,
        nodeIdAttr = config.nodeIdAttr,
        childrenAttr = config.childrenAttr;

    return new Promise((resolve, reject) => {
        // Ensure that each object given has a `parentAttr` and `nodeIdAttr` property.
        for (var i = 0; i < data.length; i++) {
            if (!obj.hasOwnProperty(parentAttr) || !obj.hasOwnProperty(nodeIdAttr)) {
                reject(`Given object did not contain a "${parentAttr}" or "${nodeIdAttr}" property: ${obj}`);
                return;
            }
        }

        // Ensure that exactly one node has a null parent property (ie, our root)
        var root = data.filter((obj) => obj[parentAttr] === null);
        if (root.length !== 1) {
            reject(`Exactly one object must have a "${parentAttr}" property set to null (the root of the tree).
                    Instead, got: ${JSON.stringify(root)}`);
            return;
        }
        root = root[0];

        // A map which will let us look up objects that have a certain parent, allowing us to construct the tree top-down.
        var parentMap = new Map();
        data.forEach((obj) => {
            if (!parentMap.has(obj[nodeIdAttr])) {
                parentMap.set(obj[nodeIdAttr], []);
            }
            parentMap[obj[nodeIdAttr]].push(obj);
        });

        function populateSubtree(subtreeRoot) {
            // Set a new parameter to store the children on this node in
            subtreeRoot[childrenAttr] = [];

            // Get children who have this subtree root as a parent
            if (parentMap.has(subtreeRoot[nodeIdAttr])) {
                parentMap.get(subtreeRoot[nodeIdAttr]).forEach((child) => {
                    subtreeRoot[childrenAttr].push(child);
                    populateSubtree(child);
                });
            }
        }

        populateSubtree(root);

        resolve(root);
    });
}

/*  Validates that the data is in the correct nested object format.
*/
function convertObject(data, config) {
    return new Promise((resolve, reject) => {
        var childrenAttr = config.childrenAttr;

        function checkSubtree(subtreeRoot) {
            var errorMessage = null;
            if (!subtreeRoot.hasOwnProperty(childrenAttr)) {
                errorMessage = `Invalid node given, missing "${childrenAttr}" property: ${JSON.stringify(subtreeRoot)}`;
            } else if (!Array.isArray(subtreeRoot[childrenAttr]) && subtreeRoot[childrenAttr] !== null) {
                errorMessage = `Invalid node given, "${childrenAttr}" property must point to an Array or null.`;
            }

            // Record the children in the
            subtreeRoot[childrenAttr] = subtreeRoot[childrenAttr];

            if (errorMessage) {
                reject(errorMessage);
                return false;
            }

            return ((subtreeRoot[childrenAttr] !== null) ? subtreeRoot[childrenAttr] : []).every(checkSubtree);
        }

        if (checkSubtree(data)) {
            resolve(data);
        }
    });
}

export default convertData;
