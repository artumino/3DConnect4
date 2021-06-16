var DrawableEntity = function(name, material, mesh, shader)
{
    Entity.call(this, name);
    this.mesh = mesh;
    this.shader = shader;
    this.material = material;
    this.vao = undefined;
}

DrawableEntity.prototype = Object.create(Entity.prototype);

DrawableEntity.prototype.init = function()
{
    this.vao = this.mesh.getVAO(this.shader);
}

DrawableEntity.prototype.draw = function()
{
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, gl.UNSIGNED_SHORT, 0 );
}

Object.defineProperty(DrawableEntity.prototype, 'constructor', { value: DrawableEntity, enumerable: false, writable: true});