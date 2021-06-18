var Scene = function()
{
    this.objects = {};
    this.sceneRoot = new Entity("Root");
    this.objects[this.sceneRoot.id] = this.sceneRoot;
    this.activeCamera = undefined;
    this.activeDirectionalLight = undefined;
    this.activePointLights = [];
    this.destroyed = false;
}

Scene.prototype.addEntity = function(entity)
{
    this.objects[entity.id] = entity;

    //FIXME: Check for parents in other scenes
    if(!entity.parent)
        entity.setParent(this.sceneRoot);

    if(entity instanceof Camera &&
        !this.activeCamera)
            this.activeCamera = entity;

    if(entity instanceof DirectionalLight &&
        !this.activeDirectionalLight)
            this.activeDirectionalLight = entity;

    if(entity instanceof PointLight &&
        this.activePointLights.length < 4)
        this.activePointLights.push(entity);
}

Scene.prototype.init = function()
{
    Object.values(this.objects).forEach(object => {
        if(object.init) object.init();
    });
}

Scene.prototype.destroy = function()
{
    Object.values(this.objects).forEach(object => {
        if(object.destroy) object.destroy();
    });
    //FIXME: Support for removing lights
    this.destroyed = true;
}