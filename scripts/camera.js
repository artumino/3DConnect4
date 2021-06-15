var Camera = function(name)
{
    Entity.call(this, name);
    this.fov = 90.0;
    this.nearPlane = 1.0;
    this.farPlane = 2000.0;
}

Camera.prototype = Object.create(Entity.prototype);

Object.defineProperty(Camera.prototype, 'constructor', {
    value: Camera,
    enumerable: false,
    writable: true
});