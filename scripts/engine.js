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
    this.time = 0;
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

GameEngine.prototype.update = function(time)
{
    var newTime = time*0.001;
    this.deltaTime = this.time - newTime;
    this.time = newTime;

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
    
        //Game Logic Update
        this.currentScene.sceneRoot.update(this.deltaTime);

        //Draw
        Object.values(this.currentScene.objects).forEach(sceneObject => {
            if(sceneObject instanceof DrawableEntity)
            {
                var shader = sceneObject.shader;

                if(shader.params["matrix_MVP"])
                    gl.uniformMatrix4fv(shader.params["matrix_MVP"], gl.FALSE, utils.transposeMatrix(utils.multiplyMatrices(this.viewProjectionMatrix, sceneObject.worldMatrix)));
                
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
    mainCamera.move(0, 12, -20);
    mainCamera.setLocalEulerRotation(0, -30, 0);
    var gameBoard = new DrawableEntity("GameBoard", {
        mainTexture: new Texture("WoodM1.jpg")
    }, meshLoader.base, Shader.getShader("ubershader"));

    var pawn1 = new DrawableEntity("Pawn1", {
        mainTexture: new Texture("WoodD1.jpg")
    }, meshLoader.piece, Shader.getShader("ubershader"));
    pawn1.setParent(gameBoard);
    pawn1.setLocalPosition(1, 2, 1);

    var pawn2 = new DrawableEntity("Pawn2", {
        mainTexture: new Texture("WoodL1.png")
    }, meshLoader.piece, Shader.getShader("ubershader"));
    pawn2.setParent(gameBoard);
    pawn2.setLocalPosition(1, 3, 1);

    mainScene.addEntity(cameraPivot);
    mainScene.addEntity(mainCamera);
    mainScene.addEntity(gameBoard);
    mainScene.addEntity(pawn1);
    mainScene.addEntity(pawn2);

    cameraPivot.addComponent({
        enabled: true,
        update: function(object, deltaTime)
        {
            object.rotate(Quaternion.fromEuler(0, 0, 1*deltaTime, 'XZY'));
        }
    });

    pawn1.addComponent({
        enabled: true,
        update: function(object, deltaTime)
        {
            object.setLocalPosition(1,2+Math.cos(engine.time*5),1);
        }
    });

    pawn2.addComponent({
        enabled: true,
        update: function(object, deltaTime)
        {
            object.setLocalPosition(1,3+Math.cos(engine.time*5),1);
        }
    });

    mainScene.init();
    engine.loadScene(mainScene);
}