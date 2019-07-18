/*  Function which enables panning of a given SVG.
 */
function enablePan(el) {
    // Whether the chart is currently being panned
    var moving = false,
        // The minimum number of pixels a chart must be dragged before it moves
        minDelta = 5,
        // The last translate positions of the chart when it ceased being panned
        lastX = 0,
        lastY = 0,
        // The current translate positions of the chart as its being panned
        currentX = 0,
        currentY = 0,
        // The cursor's position when the chart was clicked
        startX,
        startY;
    el.addEventListener("mousedown", function(e) {
        moving = true;
        startX = e.pageX;
        startY = e.pageY;
    }, false);
    el.addEventListener("mousemove", function(e) {
        var deltaX = e.pageX - startX,
            deltaY = e.pageY - startY;

        if (moving && (Math.abs(deltaX) > minDelta || Math.abs(deltaY) > minDelta)) {
            currentX = lastX + deltaX;
            currentY = lastY + deltaY;

            el.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0px)";
        }
    }, false);
    el.addEventListener("mouseup", function() {
        moving = false;
        lastX = currentX;
        lastY = currentY;
    }, false);
}; // TODO re-implement with drag events

function enableZoom(el) {

};


export {enablePan, enableZoom};
