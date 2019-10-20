import Promise from 'promise-polyfill';

/*  Performs an AJAX request to fetch a resource
 */
function fetchAjax(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function() {
        try {
            resolve(JSON.parse(xhr.responseText));
        } catch(exc) {
            reject(exc);
        }
    };
    xhr.onerror = function() {
        reject(xhr.statusText);
    };

    xhr.send();
  });
}


/*  Functions for showing/hiding SVG elements
 */
function showElement(element) {
    element.style("visibility", "visible");
}
function hideElement(element) {
    element.style("visibility", "collapse");
}

export { fetchAjax, showElement, hideElement };
