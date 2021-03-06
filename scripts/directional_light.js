var DirectionalLight = function(name, lightColor)
{
    Entity.call(this, name);
    this.direction = undefined;
    this.lightColor = lightColor;
}

DirectionalLight.prototype = Object.create(Entity.prototype);

DirectionalLight.prototype.setDirectionTo = function(entity)
{
    this.direction = computeVersor(entity.getWorldPosition(), this.getWorldPosition());
}

Object.defineProperty(DirectionalLight.prototype, 'constructor', { value: DirectionalLight, enumerable: false, writable: true});