var Input = function(canvas)
{
    this.canvas = canvas;
    this.isMouseDown = false;
    this.mousePosition = [];
    this.mouseDelta = [];
    this.lastMousePosition = [0,0];
    this.scroll = 0;
}

Input.prototype.init = function()
{
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    this.canvas.addEventListener("mouseup", this.OnMouseUp.bind(this), false);
    this.canvas.addEventListener("mousemove", this.OnMouseMove.bind(this), false);
    this.canvas.addEventListener("wheel", this.OnWheelScroll.bind(this), false);
}

Input.prototype.lateUpdate = function()
{
    this.mouseDelta = [0,0];
    this.lastMousePosition = this.mousePosition;
    this.scroll = 0;

    //Detect mouse locations and events
    const pixelX = this.mousePosition[0] * gl.canvas.width / gl.canvas.clientWidth; //Convert from browser space to canvas space
    const pixelY = gl.canvas.height - this.mousePosition[1] * gl.canvas.height / gl.canvas.clientHeight - 1;
    const data = new Uint8Array(4);
    gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    this.selectedEntityId = Entity.decodeId(data);
    //console.log(this.selectedEntityId);
}

Input.prototype.onMouseDown = function(e)
{
    this.isMouseDown = true;
}

Input.prototype.OnMouseUp = function(e)
{
    this.isMouseDown = false;
}

Input.prototype.OnMouseMove = function(e)
{
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = [ e.clientX - rect.left, e.clientY - rect.top];
    let delta = [ this.mousePosition[0] - this.lastMousePosition[0], this.mousePosition[1] - this.lastMousePosition[1] ];
    this.mouseDelta = delta;
}

Input.prototype.OnWheelScroll = function(e)
{
    this.scroll = e.deltaY;
}