var gl;
var path = window.location.pathname;
var page = path.split("/").pop();
var baseDir = window.location.href.replace(page, '');

var GameEngine = function() {
    this.entityTexture = undefined;
    this.entityBuffer = undefined;
    this.depthBuffer = undefined;
    this.currentScene = undefined;
    this.aspect = 0;
    this.projectionMatrix = [];
    this.cameraMatrix = [];
    this.viewMatrix = [];
    this.viewProjectionMatrix = [];
    this.inverseViewProjectionMatrix = [];
    this.time = 0;
    this.onInit = undefined;
    this.input = undefined;
};

GameEngine.prototype.init = async function()
{
    var canvas = document.getElementById("canvas");
        gl = canvas.getContext("webgl2");
        if (!gl) {
            document.write("GL context not opened");
        return;
    }

    utils.resizeCanvasToDisplaySize(gl.canvas);
    this.input = new Input(canvas);
    this.input.init();

    this.uberShader = Shader.getShader("ubershader");
    await this.uberShader.loader;
    this.entityShader = Shader.getShader("entity");
    await this.entityShader.loader;

    gl.useProgram(this.uberShader.program);

    await meshLoader.init();
    this.main();
}

GameEngine.prototype.main = function()
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //Setup all the buffers
    this.setupBuffers();

    //Initialize scene
    this.onInit();

    requestAnimationFrame(this.update.bind(this));
}

GameEngine.prototype.setupBuffers = function()
{
    //Frame Buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //Depth Buffer
    this.depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

    //Setup texture where entity IDs will be rendered
    this.entityTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.entityTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);

    //Entity buffer
    this.entityBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.entityBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.entityTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
}

GameEngine.prototype.update = function(time)
{
    var newTime = time*0.001;
    this.deltaTime = newTime - this.time;
    this.time = newTime;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(this.currentScene && this.currentScene.activeCamera)
    {
        // Compute the projection matrix
        this.aspect = gl.canvas.width / gl.canvas.height;
        var activeCamera = this.currentScene.activeCamera;
        this.projectionMatrix = utils.MakePerspective(activeCamera.fov, 
                                                        this.aspect, 
                                                        activeCamera.nearPlane, 
                                                        activeCamera.farPlane);
    
        // Compute the camera matrix using look at.
        this.viewMatrix = utils.invertMatrix(activeCamera.worldMatrix);
    
        this.viewProjectionMatrix = utils.multiplyMatrices(this.projectionMatrix, this.viewMatrix);
        this.inverseViewProjectionMatrix = utils.invertMatrix(this.viewProjectionMatrix);
    
        //Game Logic Update
        this.currentScene.sceneRoot.update(this.deltaTime);

        //Calculate MVPs and build render queues
        let modelViewProjectionCache = {};
        let renderQueues = {};
        Object.values(this.currentScene.objects).forEach(sceneObject => {
            if(sceneObject.draw)
            {
                modelViewProjectionCache[sceneObject.id] = utils.transposeMatrix(utils.multiplyMatrices(this.viewProjectionMatrix, sceneObject.worldMatrix));

                if(sceneObject.shader)
                {
                    let renqueQueue = sceneObject.shader.order;
                    if(!renderQueues[renqueQueue]) renderQueues[renqueQueue] = [];
                    renderQueues[renqueQueue].push(sceneObject);
                }
            }
        });

        //Draw Scene
        Object.keys(renderQueues).forEach(queue => {
            Object.values(renderQueues[queue]).forEach(sceneObject => {
                if(sceneObject.draw && sceneObject.enabled)
                    this.drawObject(sceneObject, modelViewProjectionCache[sceneObject.id]);
            });
        });

        //Draw EntityID buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.entityBuffer);
        gl.clearColor(0, 0, 0, 1);
        //We have to clear the depthBuffer cause the opaque geometry is different
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Object.values(this.currentScene.objects).forEach(sceneObject => {
            if(sceneObject.draw && sceneObject.enabled && sceneObject.clickable)
                this.drawObject(sceneObject, modelViewProjectionCache[sceneObject.id], this.entityShader);
        });
    }

    //Late Input Update
    this.input.lateUpdate();

    requestAnimationFrame(this.update.bind(this));
}

GameEngine.prototype.drawObject = function(sceneObject, matrixMVP, shaderOverride)
{
    let shader = shaderOverride || sceneObject.shader;
    let originalShader = sceneObject.shader;
    if(shader)
    {
        gl.useProgram(shader.program);

        if(shader.transparent)
        {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.enable(gl.BLEND);
        }

        if(shader.params["matrix_MVP"])
            gl.uniformMatrix4fv(shader.params["matrix_MVP"], gl.FALSE, matrixMVP);

        if(shader.params["imatrix_VP"])
            gl.uniformMatrix4fv(shader.params["imatrix_VP"], gl.FALSE, utils.transposeMatrix(this.inverseViewProjectionMatrix));
        
        if(shader.params["matrix_N"])
            gl.uniformMatrix4fv(shader.params["matrix_N"], gl.FALSE, utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(sceneObject.worldMatrix))));
        
        if(shader.params["entityID"])
            gl.uniform4fv(shader.params["entityID"], sceneObject.encodedEntityID);

        if(shader.params["directionalLightDir"])
            gl.uniform3fv(shader.params["directionalLightDir"], this.currentScene.activeDirectionalLight.direction);
        
        if(shader.params["directionalLightColor"])
            gl.uniform3fv(shader.params["directionalLightColor"], this.currentScene.activeDirectionalLight.lightColor);

        if(shader.params["pointLightLocations"])
            gl.uniformMatrix4fv(shader.params["pointLightLocations"], gl.FALSE, arrayParamToMatrix4(
                this.currentScene.activePointLights,
                light => light.getWorldPosition(),
                3
            ));

        if(shader.params["pointLightColors"])
            gl.uniformMatrix4fv(shader.params["pointLightColors"], gl.FALSE, arrayParamToMatrix4(
                this.currentScene.activePointLights,
                light => light.lightColor,
                3
            ));

        if(shader.params["pointLightDecays"])
            gl.uniform4fv(shader.params["pointLightDecays"], gl.FALSE, arrayParamToVec4(
                this.currentScene.activePointLights,
                light => light.decay
            ));

        if(shader.params["pointLightReductions"])
            gl.uniform4fv(shader.params["pointLightReductions"], gl.FALSE, arrayParamToVec4(
                this.currentScene.activePointLights,
                light => light.reductionDistance
            ));

        //Setup Material Properties
        if(sceneObject.material)
        {
            Object.entries(sceneObject.material).forEach(param => {
                let key = param[0];
                let value = param[1];
                let paramLocation = shader.params[key];
    
                if(paramLocation)
                {
                    if(Array.isArray(value))
                    {
                        if(value.length == 2)
                            gl.uniform2fv(paramLocation, value);
                        else if(value.length == 3)
                            gl.uniform3fv(paramLocation, value);
                        else if(value.length == 4)
                            gl.uniform4fv(paramLocation, value);
                    }
                    else if(value instanceof Texture)
                    {
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, value.handle);
                        gl.uniform1i(paramLocation, 0);
                    }
                    else if(value instanceof Cubemap)
                    {
                        gl.activeTexture(gl.TEXTURE0+3);
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, value.handle);
                        gl.uniform1i(paramLocation, 3);
                    }
                    else if(Number.isInteger(value))
                        gl.uniform1i(paramLocation, value);
                    else
                        gl.uniform1f(paramLocation, value);
                }
            });
        }

        if(originalShader != shader) sceneObject.shader = shader;
        sceneObject.draw();
        if(originalShader != shader) sceneObject.shader = originalShader;

        if(shader.transparent) gl.disable(gl.BLEND);
    }
}

GameEngine.prototype.loadScene = function(scene)
{
    if(!scene.destroyed)
    {
        if(this.currentScene)
            this.currentScene.destroy();
        this.currentScene = scene;
    }
    else
        console.error("Cannot reload a destroyed scene!");
}

var engine = new GameEngine();
window.onload = engine.init();

engine.onInit = function()
{
    var gameManager = new Connect4Manager(engine);
    gameManager.resetGame();
}