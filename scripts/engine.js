var sceneRoot = new Entity();
var gameEntity = new Entity();

gameEntity.setParent(sceneRoot);
gameEntity.addComponent({
    enabled: true,
    update: function(object, deltaTime)
    {
        object.move(1*deltaTime, 0, 0);
        console.log("deltaTime: " + deltaTime);
        console.log("New worldMatrix: ");
        console.log(object.worldMatrix);
    }
});
sceneRoot.setLocalEulerRotation(45,45,10);

setInterval(function(){
    sceneRoot.update(1);
}, 1000);