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
    const pixelX = this.mousePosition[0] * gl.canvas.width / gl.canvas.clientWidth;
    const pixelY = gl.canvas.height - this.mousePosition[1] * gl.canvas.height / gl.canvas.clientHeight - 1;
    const data = new Uint8Array(4);
    gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    let decodedEntityId = Entity.decodeId(data);

    if(engine.currentScene && this.selectedEntityId != decodedEntityId)
    {
        if(this.selectedEntityId)
        {
            let exitedEntity = engine.currentScene.objects[this.selectedEntityId];
            if(exitedEntity && exitedEntity.clickable) exitedEntity.processMouseExit();
        }

        if(decodedEntityId)
        {
            let enteredEntity = engine.currentScene.objects[decodedEntityId];
            if(enteredEntity && enteredEntity.clickable) enteredEntity.processMouseEnter();
        }
    }
    console.log(decodedEntityId);
    this.selectedEntityId = decodedEntityId;
}

Input.prototype.onMouseDown = function(e)
{
    this.isMouseDown = true;

    console.log("Clicked " + this.selectedEntityId);
    if(this.selectedEntityId)
    {
        let clickedObject = engine.currentScene.objects[this.selectedEntityId];
        if(clickedObject.clickable) clickedObject.processClick();
    }
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