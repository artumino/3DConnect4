var Camera = function(name)
{
    Entity.call(this, name);
    this.fov = 60.0;
    this.nearPlane = 1.0;
    this.farPlane = 1000.0;
}

Camera.prototype = Object.create(Entity.prototype);

Object.defineProperty(Camera.prototype, 'constructor', {
    value: Camera,
    enumerable: false,
    writable: true
});