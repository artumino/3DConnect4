var Cubemap = function(name)
{
    // Create a texture.
    this.handle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.handle);

    var skyboxName = baseDir + "assets/skyboxes/" + name;
    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
            url: skyboxName + '/posx.jpg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
            url:  skyboxName + '/negx.jpg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
            url:  skyboxName + '/posy.jpg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
            url:  skyboxName + '/negy.jpg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
            url:  skyboxName + '/posz.jpg',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
            url:  skyboxName + '/negz.jpg',
        },
    ];

    var skyboxTexture = this.handle;
    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;
        gl.texImage2D(target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });

    
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
}

var cubemapCache = {};
Cubemap.getOrCreate = function(name)
{
    if(cubemapCache[name])
        return cubemapCache[name];
    else
    {
        return (cubemapCache[name] = new Cubemap(name));
    }
}