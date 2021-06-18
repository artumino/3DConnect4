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
    this.normals = objModel.vertexNormals;
    this.indices = objModel.indices;
    this.texels = objModel.textures;
}

Mesh.prototype.getVAO = function(shader)
{
    let cachedVAO = this.vertexArrayMap[shader];
    if(cachedVAO)
        return cachedVAO;
    else
    {
        var vao = gl.createVertexArray();
    
        var positionAttributeLocation = shader.params["inPosition0"];
        var normalAttributeLocation = shader.params["inNormal0"];
        var uvAttributeLocation = shader.params["inUV0"];

        gl.bindVertexArray(vao);
        
        if(positionAttributeLocation >= 0)
        {
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        }
    
        if(normalAttributeLocation >= 0)
        {
            var normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(normalAttributeLocation);
            gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        }

        if(uvAttributeLocation >= 0)
        {
            var uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texels), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(uvAttributeLocation);
            gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        }
    
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.vertexArrayMap[shader] = vao;
        return vao;
    }
}

Mesh.prototype.copyFrom = function(mesh)
{
    Object.assign(this.vertices, mesh.vertices);
    Object.assign(this.normals, mesh.normals);
    Object.assign(this.indices, mesh.indices);
    Object.assign(this.texels, mesh.texels);
}