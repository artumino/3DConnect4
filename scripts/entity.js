var Entity = function() 
{
    this.enabled = true;
    this.childs = [];
    this.components = [];
    this.parent = undefined;
    this.worldMatrix = utils.identityMatrix();
    this.localMatrix = utils.identityMatrix();
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

Entity.prototype.getLocalPosition = function()
{
    return [this.localMatrix[3], this.localMatrix[7], this.localMatrix[11]];
};

Entity.prototype.setLocalPosition = function(position)
{
    this.localMatrix[3] = position[0];
    this.localMatrix[7] = position[1];
    this.localMatrix[11] = position[2];
    this.updateWorldMatrix();
};

Entity.prototype.move = function(dx, dy, dz)
{
    this.localMatrix[3] += dx;
    this.localMatrix[7] += dy;
    this.localMatrix[11] += dz;
    this.updateWorldMatrix();
};

Entity.prototype.setLocalEulerRotation = function(rx, ry, rz)
{
    var rotationMatrix = utils.MakeRotateXYZMatrix(rx, ry, rz, 1);
    for(var i = 0; i < 3; i++)
        for(var j = 0; j < 3; j++)
            this.localMatrix[(i*4)+j] = rotationMatrix[(i*4)+j];
    this.updateWorldMatrix();
};

Entity.prototype.rotate = function(rotation)
{
    let rotationMatrix = rotation.toMatrix4();
    this.localMatrix = utils.multiplyMatrices(this.localMatrix, rotationMatrix);
    this.updateWorldPosition();
};

Entity.prototype.updateWorldMatrix = function()
{
    if(this.parent != undefined)
        this.worldMatrix = utils.multiplyMatrices(this.parent.worldMatrix, this.localMatrix);
    else
        this.worldMatrix = this.localMatrix;

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