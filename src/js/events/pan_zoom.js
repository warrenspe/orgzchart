/*  Returns the translate/scale values currently set on the given element
 */
/*  Sets the translate/scale values on the given element.
 */
function _updateTransform(el, translateX, translateY, scale) {
    if (translateX !== undefined) {
        this._internal.transforms.translateX = translateX;
    }

    if (translateY !== undefined) {
        this._internal.transforms.translateY = translateY;
    }

    if (scale !== undefined) {
        this._internal.transforms.scale = scale;
    }

    el.style.transform = (
        "translate3d(" + this._internal.transforms.translateX + "px, " + this._internal.transforms.translateY + "px, 0px) " +
        "scale(" + this._internal.transforms.scale + ")"
    );
}

/*  Function which enables panning of a given SVG.
 */
function enablePan(container, toPan) {
    this._internal.pan = {
        // The minimum number of pixels a chart must be dragged before it moves
        minThreshold: 5,
        // The cursor's position when the chart begins being dragged
        cursorStartX: null,
        cursorStartY: null,
        // The charts position when it starts being dragged
        chartStartX: null,
        chartStartY: null,
        // Set to True once we cross the minimumThreshold
        panning: true,
        // The pan event handler, which is unbound when the user releases the chart
        panHandler: undefined
    };
    this._internal.transforms = this._internal.transforms || {
        translateX: 0,
        translateY: 0,
        scale: 1
    };

    function startPan(e) {
        this._internal.pan.cursorStartX = e.pageX;
        this._internal.pan.cursorStartY = e.pageY;
        this._internal.pan.chartStartX = this._internal.transforms.translateX;
        this._internal.pan.chartStartY = this._internal.transforms.translateY;
        this._internal.pan.panHandler = pan.bind(this);
        container.addEventListener("mousemove", this._internal.pan.panHandler, false);
    }

    function pan(e) {
        // Check if the mouse is not currently pressed; this can occur if the mouseup happened while off the browser
        // If so, stop panning
        if (!(e.buttons & 1)) {
            stopPan.call(this);
            return;
        }

        var deltaX = e.pageX - this._internal.pan.cursorStartX,
            deltaY = e.pageY - this._internal.pan.cursorStartY;

        if (this._internal.panning || Math.abs(deltaX) > this._internal.pan.minThreshold ||
                Math.abs(deltaY) > this._internal.pan.minThreshold) {
            this._internal.panning = true;

            var translateX = this._internal.pan.chartStartX + deltaX,
                translateY = this._internal.pan.chartStartY + deltaY;

            _updateTransform.call(this, toPan, translateX, translateY);
        }
    }

    function stopPan() {
        this._internal.pan.panning = false;
        container.removeEventListener("mousemove", this._internal.pan.panHandler, false);
    }

    container.addEventListener("mousedown", startPan.bind(this), false);
    container.addEventListener("mouseup", stopPan.bind(this), false);
}

function enableZoom(container, toScale) {
    this._internal.zoom = {
        // Amount we zoom on each wheel step
        zoomStep: .2,
    };
    this._internal.transforms = this._internal.transforms || {
        translateX: 0,
        translateY: 0,
        scale: 1
    };

    function zoom(e) {
        // If we're not scrolling vertically, do nothing
        if (!e.deltaY) {
            return;
        }

            // Determine which direction the wheel was spun
        var direction = (e.deltaY > 0) ? -1 : 1,
            // Calculate the amount that we will change the scale value by
            delta = this._internal.zoom.zoomStep * this._internal.transforms.scale * direction,
            // Calculate what the next scale value will be
            nextZoom = Math.max(Math.min(this._internal.transforms.scale + delta, this.config.maxZoom), this.config.minZoom);

            // The code below records where the cursor is relative to the bounds of the chart so that we can retain that
            // post zoom.  This gives us a zoom-in effect similar to that of google earth where the map zooms in where your
            // cursor is positioned
        var svgBounds = toScale.getBoundingClientRect(),
            // Current dimensions of the svg chart
            currentWidth = svgBounds.right - svgBounds.left,
            currentHeight = svgBounds.bottom - svgBounds.top,
            // Cursor position within the chart
            cursorPositionX = e.pageX - svgBounds.left,
            cursorPositionY = e.pageY - svgBounds.top,
            // Cursor position within the chart using percentages
            cursorPositionPercentX = cursorPositionX / (svgBounds.right - svgBounds.left),
            cursorPositionPercentY = cursorPositionY / (svgBounds.bottom - svgBounds.top),
            // width/height of the svg chart after scaling
            zoomFactor = nextZoom / this._internal.transforms.scale,
            postScaleWidth = currentWidth * zoomFactor,
            postScaleHeight = currentHeight * zoomFactor,
            // Amount we must translate the graph to retain the same cursor position percentage
            translateX = this._internal.transforms.translateX + cursorPositionX - (postScaleWidth * cursorPositionPercentX),
            translateY = this._internal.transforms.translateY + cursorPositionY - (postScaleHeight * cursorPositionPercentY);

        _updateTransform.call(this, toScale, translateX, translateY, nextZoom);
    }

    container.addEventListener("wheel", zoom.bind(this), false);
}

export {enablePan, enableZoom};
