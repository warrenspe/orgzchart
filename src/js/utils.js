import Promise from 'promise-polyfill';

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

export { fetchAjax };
