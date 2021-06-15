var gl;
var path = window.location.pathname;
var page = path.split("/").pop();
var baseDir = window.location.href.replace(page, '');

var GameEngine = function() {
    this.currentScene = undefined;
    this.aspect = 0;
    this.projectionMatrix = [];
    this.cameraMatrix = [];
    this.viewMatrix = [];
    this.viewProjectionMatrix = [];
    this.onInit = undefined;
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
    this.uberShader = Shader.getShader("ubershader");
    await this.uberShader.loader;

    gl.useProgram(this.uberShader.program);

    await meshLoader.init();
    this.main();
}

GameEngine.prototype.main = function()
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    this.onInit();

    requestAnimationFrame(this.update.bind(this));
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
                                                        this.aspect, 
                                                        activeCamera.nearPlane, 
                                                        activeCamera.farPlane);
    
        // Compute the camera matrix using look at.
        this.cameraMatrix = utils.MakeView(activeCamera.getWorldPosition(), activeCamera.getWorldEulerRotation());
        this.viewMatrix = utils.invertMatrix(this.cameraMatrix);
    
        this.viewProjectionMatrix = utils.multiplyMatrices(this.projectionMatrix, this.viewMatrix);
    
        //Game Logic Update
        this.currentScene.sceneRoot.update(deltaTime);

        //Draw
        Object.values(this.currentScene.objects).forEach(sceneObject => {
            if(sceneObject instanceof DrawableEntity)
            {
                var shader = sceneObject.shader;

                if(shader.params["matrix_MVP"])
                    gl.uniformMatrix4fv(shader.params["matrix_MVP"], gl.FALSE, utils.multiplyMatrices(this.viewProjectionMatrix, sceneObject.worldMatrix));
                
                if(shader.params["matrix_N"])
                    gl.uniformMatrix4fv(shader.params["matrix_N"], gl.FALSE, utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(sceneObject.worldMatrix))));

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
                        else
                            gl.uniform1fv(paramLocation, value);
                    }
                });

                gl.bindVertexArray(sceneObject.drawInfo.vertexArray);
                gl.drawElements(gl.TRIANGLES, sceneObject.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
            }
        });
    }

    requestAnimationFrame(this.update.bind(this));
}

GameEngine.prototype.loadScene = function(scene)
{
    this.currentScene = scene;
}

var engine = new GameEngine();
window.onload = engine.init();

engine.onInit = function()
{
    var mainScene = new Scene();

    var cameraPivot = new Entity("CameraPivot");
    var mainCamera = new Camera("Main Camera");
    mainCamera.setParent(cameraPivot);
    mainCamera.move(0, 0, -10);
    //mainCamera.setLocalEulerRotation(-45, 0, 0);

    var gameBoard = new DrawableEntity("GameBoard", {
        mainTexture: new Texture("WoodM1.jpg")
    }, meshLoader.base, Shader.getShader("ubershader"));

    mainScene.addEntity(cameraPivot);
    mainScene.addEntity(mainCamera);
    mainScene.addEntity(gameBoard);

    mainScene.init();
    engine.loadScene(mainScene);
}