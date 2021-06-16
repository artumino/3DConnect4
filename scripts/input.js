var Input = function(canvas)
{
    this.canvas = canvas;
    this.isMouseDown = false;
    this.mousePosition = [];
    this.mouseDelta = [];
    this.lastMousePosition = [0,0];
}

Input.prototype.init = function()
{
    this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
    this.canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);
    this.canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
}

Input.prototype.update = function()
{
    this.lastMousePosition = this.mousePosition;
}

Input.prototype.mouseDown = function(e)
{
    this.isMouseDown = true;
}

Input.prototype.mouseUp = function(e)
{
    this.isMouseDown = false;
}

Input.prototype.mouseMove = function(e)
{
    this.mousePosition = [ e.clientX, e.clientY ];
    let delta = [ this.mousePosition[0] - this.lastMousePosition[0], this.mousePosition[1] - this.lastMousePosition[1] ];
    this.mouseDelta = delta;
}
