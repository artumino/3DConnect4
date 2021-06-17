var lastEntityId = 0;
var Entity = function(name) 
{
    this.name = name;
    this.id = lastEntityId++;
    this.encodedEntityID = Entity.encodeId(this.id);
    this.clickable = true;
    this.enabled = true;
    this.childs = [];
    this.components = [];
    this.parent = undefined;
    this.worldMatrix = utils.identityMatrix();
    this.localMatrix = utils.identityMatrix();
    this.localPosition = [0,0,0];
    this.localRotation = Quaternion.ONE;
};

/*
        SCENE LOGIC
*/
Entity.prototype.setParent = function(parent)
{
    if(this.parent)
        this.parent.removeChild(this);

    this.parent = parent;
    parent.childs.push(this);

    this.updateWorldMatrix();
};

Entity.prototype.removeChild = function(child)
{
    const index = this.childs.indexOf(this);
    if (index > -1) {
        this.childs.splice(index, 1);
        child.parent = undefined;
    }
}

Entity.prototype.setLocalPosition = function(x, y, z)
{
    this.localPosition[0] = x;
    this.localPosition[1] = y;
    this.localPosition[2] = z;
    this.updateWorldMatrix();
};

Entity.prototype.getWorldPosition = function()
{
    return [this.worldMatrix[3], this.worldMatrix[7], this.worldMatrix[11]];
};

Entity.prototype.move = function(dx, dy, dz)
{
    this.localPosition[0] += dx;
    this.localPosition[1] += dy;
    this.localPosition[2] += dz;
    this.updateWorldMatrix();
};

Entity.prototype.predictMove = function(dx, dy, dz)
{
    return [
    this.localPosition[0] + dx,
    this.localPosition[1] + dy,
    this.localPosition[2] + dz ];
};

Entity.prototype.setLocalEulerRotation = function(rx, ry, rz)
{
    this.localRotation = Quaternion.fromEuler(utils.degToRad(rx), utils.degToRad(ry), utils.degToRad(rz), order="ZXY");
    this.updateWorldMatrix();
};

Entity.prototype.rotateEuler = function(rx, ry, rz)
{
    let rotation = Quaternion.fromEuler(utils.degToRad(rx), utils.degToRad(ry), utils.degToRad(rz), order="ZXY");
    this.rotate(rotation);
};

Entity.prototype.rotate = function(rotation)
{
    this.localRotation = rotation.mul(this.localRotation);
    this.updateWorldMatrix();
};

Entity.prototype.updateWorldMatrix = function()
{
    let T = utils.MakeTranslateMatrix(this.localPosition[0], this.localPosition[1], -this.localPosition[2]);
    let R = this.localRotation.toMatrix4();

    this.localMatrix = utils.multiplyMatrices(T, R);

    if(this.parent != undefined)
        this.worldMatrix = utils.multiplyMatrices(this.parent.worldMatrix, this.localMatrix);
    else
        utils.copy(this.localMatrix, this.worldMatrix);

    this.childs.forEach(child => {
        child.updateWorldMatrix();
    });
};

/*
        GAME LOGIC
*/
Entity.prototype.addComponent = function(component)
{
    this.components.push(component);
};

Entity.prototype.removeComponent = function(component)
{
    let indexOfComponent = this.components.indexOf(component);
    if(indexOfComponent >= 0)
        this.components.splice(indexOfComponent, 1);
};

Entity.prototype.destroy = function()
{
    for(component in this.components)
        if(component.destroy) component.destroy();
}

Entity.prototype.update = function(deltaTime)
{
    if(this.enabled)
    {
        this.components.forEach(component => {
            if(component.enabled)
            {
                component.update(this, deltaTime);
            }
        });

        this.childs.forEach(child => {
            if(child.update)
                child.update(deltaTime);
        });
    }
}

Entity.prototype.processClick = function()
{
    if(this.clickable)
    {
        this.components.forEach(component => {
            if(component.enabled && component.onClick)
            {
                component.onClick(this);
            }
        }).bind(this);
    }
};

/*
    Entity ID Encoding
*/
Entity.encodeId = function(id)
{
    return [
        ((id >>  0) & 0xFF) / 0xFF,
        ((id >>  8) & 0xFF) / 0xFF,
        ((id >> 16) & 0xFF) / 0xFF,
        ((id >> 24) & 0xFF) / 0xFF,
    ];
}

Entity.decodeId = function(idVector)
{
    return idVector[0] + (idVector[1] << 8) + (idVector[2] << 16) + (idVector[3] << 24);
}