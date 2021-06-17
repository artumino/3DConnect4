var PointLight = function(name, position, lightColor, reductionDistance)
{
    Entity.call(this, name);
    this.localPosition = position;
    this.lightColor = lightColor;
    this.decay = 0;
    this.reductionDistance = reductionDistance;
}

PointLight.prototype = Object.create(Entity.prototype);

Object.defineProperty(PointLight.prototype, 'constructor', { value: PointLight, enumerable: false, writable: true});