var DrawableEntity = function(name, material, mesh, shader)
{
    Entity.call(this, name);
    this.mesh = mesh;
    this.shader = shader;
    this.material = material;
    this.drawInfo = {
        bufferLenght: this.mesh.bufferLength,
        vertexArray: this.mesh.vertexArray
    };
}

DrawableEntity.prototype = Object.create(Entity.prototype);

DrawableEntity.prototype.init = function()
{
    this.drawInfo.bufferLenght = this.mesh.indices.length;
    this.drawInfo.vertexArray = this.mesh.getVAO(this.shader);
}

Object.defineProperty(DrawableEntity.prototype, 'constructor', { value: DrawableEntity, enumerable: false, writable: true});