var Scene = function()
{
    this.objects = {};
    this.sceneRoot = new Entity("Root");
    this.objects[sceneRoot.id] = sceneRoot;
    this.activeCamera = undefined;
}

Scene.prototype.addEntity = function(entity)
{
    this.objects[entity.id] = entity;

    if(entity instanceof Camera &&
        !this.activeCamera)
            this.activeCamera = entity;
}