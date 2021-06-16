const gameRows = 4;
const gameColumns = 4;
const gameMaxStack = 5;

var Connect4Manager = function(gameEngine)
{
    this.gameEngine = gameEngine;
    this.gameScene = undefined;
    this.gameBoard = undefined;
    this.gameState = undefined;
}

Connect4Manager.prototype.resetGame = function()
{
    //Reset logic state
    this.gameState = new Array(gameRows);
    for(let i = 0; i < gameRows; i++)
    {
        let columns = new Array(gameColumns);
        for(let j = 0; j < gameColumns; j++)
            columns[j] = [];
        this.gameState[i] = columns;
    }


    //Reset Game Scene
    this.reloadScene();
}

Connect4Manager.prototype.reloadScene = function()
{
    mouseStartPosition = null;
    this.gameScene  = new Scene();

    var cameraPivot = new Entity("CameraPivot");

    var cameraGimbal = new Entity("CameraGimbal");
    cameraGimbal.setLocalEulerRotation(0, -30, 0);
    cameraGimbal.setParent(cameraPivot);

    var mainCamera = new Camera("Main Camera");
    mainCamera.setParent(cameraGimbal);
    mainCamera.move(0, 0, -20);
    
    this.gameBoard = new DrawableEntity("GameBoard", {
        mainTexture: Texture.getOrCreate("WoodM1.jpg")
    }, meshLoader.base, Shader.getShader("ubershader"));
    this.gameBoard.move(0, -2, 0);

    var skyBox = new Skybox("Skybox", {
        mainTexture: Cubemap.getOrCreate("skybox/beach")
    }, Shader.getShader("skybox"));

    this.gameScene.addEntity(cameraPivot);
    this.gameScene.addEntity(mainCamera);
    this.gameScene.addEntity(this.gameBoard);
    this.gameScene.addEntity(skyBox);

    var inputManager = this.gameEngine.input;
    cameraPivot.addComponent({
        enabled: true,
        update: function(object, deltaTime)
        {
            if(inputManager.isMouseDown)
            {
                // Camera rotation
                let degrees = [ inputManager.mouseDelta[0] * 180 / gl.canvas.width, inputManager.mouseDelta[1] * 180 / gl.canvas.height ];
                object.rotateEuler(0, 0, -degrees[0]);
            }
            
            // Camera translation
            let movement = -inputManager.scroll * 0.5 * deltaTime;
            if(movement != 0)
            {
                let finalPosition = mainCamera.predictMove(0, 0, movement);
                const threshold = -3;
                const maxDistance = -20;
                if (finalPosition[2] > threshold)
                    mainCamera.setLocalPosition(0, 0, threshold);
                else if(finalPosition[2] < maxDistance)
                    mainCamera.setLocalPosition(0, 0, maxDistance);
                else
                    mainCamera.move(0, 0, movement);
            }
        }
    });

    cameraGimbal.addComponent({
        enabled: true,
        update: function(object, deltaTime)
        {
            if(inputManager.isMouseDown)
            {
                let degrees = [ inputManager.mouseDelta[0] * 180 / gl.canvas.width, inputManager.mouseDelta[1] * 180 / gl.canvas.height ];
                object.rotateEuler(0, -degrees[1], 0);
            }
        }
    });

    let connectManager = this;
    cameraPivot.addComponent({
        enabled: true,
        time: 0.0,
        lastInsertion: [0, 0],
        player: 0,
        terminated: false,
        update: function(object, deltaTime)
        {
            this.time += deltaTime;
            if(this.time > 0.1)
            {
                if(!this.terminated)
                {
                    this.player = Math.ceil(Math.random() * 1000);
                    this.terminated = !connectManager.dropPiece(this.player % 2, this.lastInsertion[0], this.lastInsertion[1]);
                    this.lastInsertion[1] += 1;
                    if(this.lastInsertion[1] >= gameColumns)
                    {
                        this.lastInsertion[1] = 0;
                        this.lastInsertion[0] += 1;
                        if(this.lastInsertion[0] >= gameRows)
                            this.lastInsertion[0] = 0;
                    }
                    this.time = 0;
                }
                else if(this.time > 5)
                    connectManager.resetGame();
            }
        }
    });

    this.gameScene.init();
    this.gameEngine.loadScene(this.gameScene);
}

Connect4Manager.prototype.dropPiece = function(player, row, column)
{
    var designedStack = this.gameState[row][column];
    if(this.gameScene && designedStack && designedStack.length < gameMaxStack)
    {
        const depth = designedStack.push(player);
        const pawnBoardCoordinates = this.fromStateToBoardCoords(row, column, depth);
        const startPosition = [pawnBoardCoordinates[0], 10, pawnBoardCoordinates[2]];
        const animationDelta = [pawnBoardCoordinates[0] - startPosition[0],
                                pawnBoardCoordinates[1] - startPosition[1],
                                pawnBoardCoordinates[2] - startPosition[2]]


        let pawn = new DrawableEntity("Pawn_" + row + "_" + column + "_" + depth, {
            mainTexture: Texture.getOrCreate(player == 1 ? "WoodD1.jpg" : "WoodL1.png")
        }, meshLoader.piece, Shader.getShader("ubershader"));
        pawn.setParent(this.gameBoard);
        pawn.setLocalPosition(startPosition[0], startPosition[1], startPosition[2]);

        //Add falling animation
        pawn.addComponent({
            enabled: true,
            time: 0.0,
            duration: 1.0,
            update: function(object, deltaTime)
            {
                this.time += deltaTime;
                let interpolationFactor = Math.min(1, Math.max(0, this.time / this.duration));
                object.setLocalPosition(startPosition[0] + animationDelta[0]*interpolationFactor,
                    startPosition[1] + animationDelta[1]*interpolationFactor,
                    startPosition[2] + animationDelta[2]*interpolationFactor);

                if(interpolationFactor == 1)
                {
                    this.enabled = false;
                    object.removeComponent(this);
                }
            }
        });

        pawn.init();
        this.gameScene.addEntity(pawn);
        return true;
    }
    
    return false;
}

Connect4Manager.prototype.fromStateToBoardCoords = function(i, j, depth)
{
    return [-3 + i*2, depth,-3 + j*2]
}

Connect4Manager.prototype.processWinCondition = function()
{

}