var Shader = function(name)
{
    this.name = name;
    this.program = undefined;
    this.params = {};
    this.loader = this.load(name);
}

Shader.prototype.load = async function()
{
    var shaderDir = baseDir + "shaders/" + this.name + "/"; 
    var that = this;

    await utils.loadFiles([shaderDir + this.name + '_vs.glsl', shaderDir + this.name + '_fs.glsl', shaderDir + this.name + '.params'], function (shaderText) {
        that.program = utils.createAndCompileShaders(gl, shaderText);
        var paramDefinition = JSON.parse(shaderText[2]);
        
        paramDefinition["uniforms"].forEach(paramName => {
            that.params[paramName] = gl.getUniformLocation(that.program, paramName);
        });

        paramDefinition["attributes"].forEach(paramName => {
            that.params[paramName] = gl.getAttribLocation(that.program, paramName);
        });
    });
}

var shaderMap = {};
Shader.getShader = function(name) {
    if(shaderMap[name])
        return shaderMap[name];
    else
        return (shaderMap[name] = new Shader(name));
}