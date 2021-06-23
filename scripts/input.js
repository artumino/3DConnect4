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
    this.selectedEntityId = decodedEntityId;
}

Input.prototype.mouseToWorld = function()
{
    //We calculate the normalised device coordinates from the pixel coordinates of the canvas
    var normX = (2*this.mousePosition[0])/ gl.canvas.width - 1;
    var normY = 1 - (2*this.mousePosition[1]) / gl.canvas.height;

    //We need to go through the transformation pipeline in the inverse order so we invert the matrices
    var projInv = utils.invertMatrix(engine.projectionMatrix);
    var viewInv = utils.invertMatrix(engine.viewMatrix);

    //Find the point (un)projected on the near plane, from clip space coords to eye coords
    //z = -1 makes it so the point is on the near plane
    //w = 1 is for the homogeneous coordinates in clip space
    var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);

    //This finds the direction of the ray in eye space
    //Formally, to calculate the direction you would do dir = point - eyePos but since we are in eye space eyePos = [0,0,0] 
    //w = 0 is because this is not a point anymore but is considered as a direction
    var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];
    var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
    var ray = new Ray(engine.currentScene.activeCamera.getWorldPosition(), utils.normalize(rayDir));
    return engine.doRaycast(ray);
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