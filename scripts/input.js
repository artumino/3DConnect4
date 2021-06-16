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
    this.mousePosition = [ e.clientX, e.clientY ];
    let delta = [ this.mousePosition[0] - this.lastMousePosition[0], this.mousePosition[1] - this.lastMousePosition[1] ];
    this.mouseDelta = delta;
}

Input.prototype.OnWheelScroll = function(e)
{
    this.scroll = e.deltaY;
}