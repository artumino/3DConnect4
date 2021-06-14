var gl;
var GameEngine = function() {
    this.currentScene = undefined;
    this.aspect = 0;
    this.projectionMatrix = [];
    this.cameraMatrix = [];
    this.viewMatrix = [];
    this.viewProjectionMatrix = [];
};

GameEngine.prototype.init = async function()
{
    var path = window.location.pathname;
    var page = path.split("/").pop();
    var baseDir = window.location.href.replace(page, '');
    var shaderDir = baseDir + "shaders/"; 

    var canvas = document.getElementById("canvas");
        gl = canvas.getContext("webgl2");
        if (!gl) {
            document.write("GL context not opened");
        return;
    }

    utils.resizeCanvasToDisplaySize(gl.canvas);

    //await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    //    this.uberShader = utils.createAndCompileShaders(gl, shaderText);
    //});

    //gl.useProgram(this.uberShader);
}

GameEngine.prototype.update = function(deltaTime)
{
    deltaTime *= 0.001;

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(this.currentScene && this.currentScene.activeCamera)
    {
        // Compute the projection matrix
        this.aspect = gl.canvas.width / gl.canvas.height;
        var activeCamera = this.currentScene.activeCamera;
        this.projectionMatrix = utils.MakePerspective(activeCamera.fov, 
                                                        aspect, 
                                                        activeCamera.nearPlane, 
                                                        activeCamera.farPlane);
    
        // Compute the camera matrix using look at.
        this.cameraMatrix = utils.MakeView(activeCamera.getWorldPosition(), activeCamera.getWorldEulerRotation());
        this.viewMatrix = utils.invertMatrix(cameraMatrix);
    
        this.viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);
    
        this.currentScene.sceneRoot.update(deltaTime);
    }

    requestAnimationFrame(engine.update);
}

GameEngine.prototype.loadScene = function(scene)
{
    this.currentScene = scene;
}

var engine = new GameEngine();
window.onload = engine.init();
requestAnimationFrame(engine.update);
