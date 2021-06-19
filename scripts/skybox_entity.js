var Skybox = function(name, skyboxMap, reflectionMap, ambientIntensity, material, shader)
{
    Entity.call(this, name);
    this.skyboxVertPos = new Float32Array(
    [
        -1, -1, 1.0,
        1, -1, 1.0,
        -1,  1, 1.0,
        -1,  1, 1.0,
        1, -1, 1.0,
        1,  1, 1.0,
    ]);
    this.shader = shader;
    this.ambientIntensity = ambientIntensity;
    this.material = material || {};
    this.material.mainTexture = skyboxMap;
    this.skyMap = skyboxMap;
    this.reflectionMap = reflectionMap;
    this.vao = undefined;
}

Skybox.prototype = Object.create(Entity.prototype);

Skybox.prototype.init = function()
{
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    var positionAttributeLocation = this.shader.params["inPosition0"];
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.skyboxVertPos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

Skybox.prototype.draw = function()
{
    gl.bindVertexArray(this.vao);
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, 1*6);
}

Object.defineProperty(Skybox.prototype, 'constructor', { value: Skybox, enumerable: false, writable: true});