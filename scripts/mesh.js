var Mesh = function()
{
    this.vertices = [];
    this.normals = [];
    this.texels = [];
    this.indices = [];
    this.vertexArrayMap = {};
}

Mesh.prototype.loadObj = async function(filename)
{
    let objStr = await utils.get_objstr(filename);
    let objModel = new OBJ.Mesh(objStr);
    this.vertices = objModel.vertices;
    this.normals = objModel.normals;
    this.indices = objModel.indices;
    this.texels = objModel.textures;
}

Mesh.prototype.getVAO = function(shader)
{
    if(this.vertexArrayMap[shader])
        return this.vertexArrayMap[shader];
    else
    {
        this.vertexArrayMap[shader] = gl.createVertexArray();
    
        gl.bindVertexArray(this.vertexArrayMap[shader]);
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.params["inPosition0"]);
        gl.vertexAttribPointer(shader.params["inPosition0"], 3, gl.FLOAT, false, 0, 0);
    
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.params["inNormal0"]);
        gl.vertexAttribPointer(shader.params["inNormal0"], 3, gl.FLOAT, false, 0, 0);
    
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW); 
    }
}

Mesh.prototype.copyFrom = function(mesh)
{
    Object.assign(this.vertices, mesh.vertices);
    Object.assign(this.normals, mesh.normals);
    Object.assign(this.indices, mesh.indices);
    Object.assign(this.texels, mesh.texels);
}