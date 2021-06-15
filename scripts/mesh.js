var Mesh = function()
{
    Entity.call(this);

    this.vertices = [];
    this.normals = [];
    this.texels = [];
    this.indices = [];
}

Mesh.prototype = Object.create(Entity.prototype);

Mesh.prototype.loadObj = function(filename)
{
    let objStr = await utils.get_objstr(filename);
    let objModel = new OBJ.Mesh(objStr);
    this.vertices = objModel.vertices;
    this.normals = objModel.normals;
    this.indices = objModel.indices;
    this.texels = objModel.textures;
}

Mesh.prototype.copyFrom = function(mesh)
{
    Object.assign(this.vertices, mesh.vertices);
    Object.assign(this.normals, mesh.normals);
    Object.assign(this.indices, mesh.indices);
    Object.assign(this.texels, mesh.texels);
}

Object.defineProperty(Mesh.prototype, 'constructor', { value: Mesh, enumerable: false, writable: true});