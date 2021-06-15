var Scene = function()
{
    this.objects = {};
    this.sceneRoot = new Entity("Root");
    this.objects[this.sceneRoot.id] = this.sceneRoot;
    this.activeCamera = undefined;
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
}

Scene.prototype.init = function()
{
    Object.values(this.objects).forEach(object => {
        if(object.init) object.init();
    })
}