function _updateTransform(el, translateX, translateY, scale) {
    if (translateX !== undefined) {
        el.dataset["translateX"] = translateX;
    } else if (!el.dataset.hasOwnProperty("translateX")) {
        el.dataset["translateX"] = 0;
    }

    if (translateY !== undefined) {
        el.dataset["translateY"] = translateY;
    } else if (!el.dataset.hasOwnProperty("translateY")) {
        el.dataset["translateY"] = 0;
    }

    if (scale !== undefined) {
        el.dataset["scale"] = scale;
    } else if (!el.dataset.hasOwnProperty("scale")) {
        el.dataset["scale"] = 1;
    }

    el.style.transform = (
        "translate3d(" + el.dataset["translateX"] + "px, " + el.dataset["translateY"] + "px, 0px) " +
        "scale(" + el.dataset["scale"] + ")"
    );
}

/*  Function which enables panning of a given SVG.
 */
function enablePan(el) {
        // The minimum number of pixels a chart must be dragged before it moves
    var minDelta = 5, // TODO config
        // The cursor's position when the chart was clicked
        startX,
        startY,
        // The current translate positions of the chart as its being panned
        currentX = 0,
        currentY = 0,
        // The last translate positions of the chart when it ceased being panned
        lastX = 0,
        lastY = 0;

    function startPan(e) {
        startX = e.pageX;
        startY = e.pageY;
        el.addEventListener("mousemove", pan, false);
    }

    function pan(e) {
        // Check if the mouse is not currently pressed; this can occur if the mouseup happened while off the browser
        // If so, stop panning
        if (!(e.buttons & 1)) {
            stopPan();
            return;
        }

        var deltaX = e.pageX - startX,
            deltaY = e.pageY - startY;

        if (Math.abs(deltaX) > minDelta || Math.abs(deltaY) > minDelta) {
            currentX = lastX + deltaX;
            currentY = lastY + deltaY;

            _updateTransform(el, currentX, currentY);
        }
    }

    function stopPan() {
        lastX = currentX;
        lastY = currentY;
        el.removeEventListener("mousemove", pan, false);
    }

    el.addEventListener("mousedown", startPan, false);
    el.addEventListener("mouseup", stopPan, false);
}

function enableZoom(container, toScale) {
    var zoomStep = .2, // TODO config
        currentZoom = 1,
        maxZoom = 10, // TODO config
        minZoom = .01; // TODO config

//    function zoom(e) {
//        // If we're not scrolling vertically, do nothing
//        if (!e.deltaY) {
//            return;
//        }
//
//        // Calculate how much we will be scrolled next
//        var direction = (e.deltaY > 0) ? -1 : 1,
//            delta = zoomStep * currentZoom * direction,
//            nextZoom = Math.max(Math.min(currentZoom + delta, maxZoom), minZoom);
//
//        // Record where the cursor is relative to the bounds of the chart so that we can retain that post zoom
//        // This gives us a zoom-in effect similar to that of google earth where the map zooms in where your cursor
//        // is positioned
//        var svgBounds = toScale.getBoundingClientRect(),
//            cursorPositionPercentX = (e.pageX - svgBounds.left) / (svgBounds.right - svgBounds.left),
//            cursorPositionPercentY = (e.pageY - svgBounds.top) / (svgBounds.bottom - svgBounds.top);
//
//        _updateTransform(toScale, undefined, undefined, currentZoom);
//        currentZoom = nextZoom;
//
//        svgBounds = toScale.getBoundingClientRect();
//        var pixelsToSameX = (svgBounds.right - svgBounds.left) * cursorPositionPercentX,
//            actualPositionOfPreviousX = svgBounds.left + pixelsToSameX,
//            offsetX = e.pageX - actualPositionOfPreviousX,
//            pixelsToSameY = (svgBounds.bottom - svgBounds.top) * cursorPositionPercentY,
//            actualPositionOfPreviousY = svgBounds.top + pixelsToSameY,
//            offsetY = e.pageY - actualPositionOfPreviousY;
//
//        _updateTransform(toScale, offsetX, offsetY);
//    }

    function zoom(e) {
        // If we're not scrolling vertically, do nothing
        if (!e.deltaY) {
            return;
        }

        // Calculate how much we will be scrolled next
        var direction = (e.deltaY > 0) ? -1 : 1,
            delta = zoomStep * currentZoom * direction,
            nextZoom = Math.max(Math.min(currentZoom + delta, maxZoom), minZoom);

        // Record where the cursor is relative to the bounds of the chart so that we can retain that post zoom
        // This gives us a zoom-in effect similar to that of google earth where the map zooms in where your cursor
        // is positioned
        var svgBounds = toScale.getBoundingClientRect(),
            cursorPositionPercentX = (e.pageX - svgBounds.left) / (svgBounds.right - svgBounds.left),
            cursorPositionPercentY = (e.pageY - svgBounds.top) / (svgBounds.bottom - svgBounds.top);

        _updateTransform(toScale, undefined, undefined, nextZoom);
        currentZoom = nextZoom;

        return

        svgBounds = toScale.getBoundingClientRect();
        var pixelsToSameX = (svgBounds.right - svgBounds.left) * cursorPositionPercentX,
            actualPositionOfPreviousX = svgBounds.left + pixelsToSameX,
            offsetX = e.pageX - actualPositionOfPreviousX,
            pixelsToSameY = (svgBounds.bottom - svgBounds.top) * cursorPositionPercentY,
            actualPositionOfPreviousY = svgBounds.top + pixelsToSameY,
            offsetY = e.pageY - actualPositionOfPreviousY;

        _updateTransform(toScale, offsetX, offsetY);
    }

    container.addEventListener("wheel", zoom, false);
}


export {enablePan, enableZoom};
