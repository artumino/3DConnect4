var PointLight = function(name, lightColor, reductionDistance, decay)
{
    Entity.call(this, name);
    this.lightColor = lightColor;
    this.decay = decay;
    this.reductionDistance = reductionDistance;
}

PointLight.prototype = Object.create(Entity.prototype);

Object.defineProperty(PointLight.prototype, 'constructor', { value: PointLight, enumerable: false, writable: true});