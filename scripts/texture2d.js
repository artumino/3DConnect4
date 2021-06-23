var Texture = function(name)
{
    this.handle = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.handle);

    this.image = new Image();
    this.image.src = baseDir + "assets/" + name;

    var that = this;
    this.image.onload = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, that.handle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, that.image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
}

var textureCache = {};
Texture.getOrCreate = function(name)
{
    if(textureCache[name])
        return textureCache[name];
    else
    {
        return (textureCache[name] = new Texture(name));
    }
}