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
    let connectManager = this;
    mouseStartPosition = null;
    this.gameScene  = new Scene();

    let cameraPivot = new Entity("CameraPivot");

    let cameraGimbal = new Entity("CameraGimbal");
    cameraGimbal.setLocalEulerRotation(0, -30, 0);
    cameraGimbal.setParent(cameraPivot);

    let mainCamera = new Camera("Main Camera");
    mainCamera.setParent(cameraGimbal);
    mainCamera.move(0, 0, -20);
    
    this.gameBoard = new DrawableEntity("GameBoard", {
        mainTexture: Texture.getOrCreate("WoodM1.jpg")
    }, meshLoader.base, Shader.getShader("ubershader"));
    this.gameBoard.clickable = true;
    this.gameBoard.move(0, -2, 0);

    let skyBox = new Skybox("Skybox", {
        blurFactor: 2,
        mainTexture: Cubemap.getOrCreate("room")
    }, Shader.getShader("skybox"));

    this.gameScene.addEntity(cameraPivot);
    this.gameScene.addEntity(mainCamera);
    this.gameScene.addEntity(this.gameBoard);
    this.gameScene.addEntity(skyBox);

    //Pawn Drop Selectors
    //for(let i = 0; i < gameRows; i++)
    //{
    //    for(let j = 0; i < gameColumns; j++)
    //    {
    //        let pawnDropSelector = new DrawableEntity("PawnSelector_" + i + "_" + j, 
    //                                                  undefined,
    //                                                  meshLoader.pawnSelector,
    //                                                  undefined);
    //        pawnDropSelector.setParent(this.gameBoard);
    //        pawnDropSelector.clickable = true;
    //        pawnDropSelector.addComponent({
    //            enabled: true,
    //            onClick: function(object)
    //            {
    //                if(connectManager.dropPiece(connectManager.player, i, j))
    //                {
    //                    setTimeout(function () {
    //                        connectManager.resetGame();
    //                    }, 5000);
    //                }
    //            }
    //            //TODO: Maybe highlight on mouse enter/exit?
    //        });
    //        this.gameScene.addEntity(pawnDropSelector);
    //    }
    //}

    let inputManager = this.gameEngine.input;
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

        if(this.processWinCondition(player, row, column, depth-1))
        {
            console.log(player + " has won!");
            return false;
        }

        return true;
    }
    
    return false;
}

Connect4Manager.prototype.fromStateToBoardCoords = function(i, j, depth)
{
    return [-3 + i*2, depth,-3 + j*2]
}

Connect4Manager.prototype.processWinCondition = function(player, row, column, depth)
{
    const indexer = [row, column, depth];
    const winningDirections = [
        [1,0,0], //Row
        [0,1,0], //Column
        [0,0,1], //Depth
        [1,1,0], //Horizontal Plane Diagonal1
        [-1,1,0], //Horizontal Plane Diagonal2
        [1,0,1], //Vertical Plane Diagonal1
        [-1,0,1], //Vertical Plane Diagonal2
        [0,1,1], //Vertical Plane Diagonal3
        [0,-1,1], //Vertical Plane Diagonal4
        [1,1,1], //Cube Diagonal1
        [-1,-1,1], //Cube Diagonal2
    ];

    var that = this;
    return winningDirections.some(winningDirection =>
    {
        return that.countInDirection(player, indexer, winningDirection) >= 4;
    });
}

Connect4Manager.prototype.countInDirection = function(player, indexer, direction)
{
    if(this.indexState(indexer) != player)
        return 0;

    let count = 1;
    const backDirection = [-direction[0], -direction[1], -direction[2]];

    //Forward pass
    for(let forwardIndex = this.iterateForward(indexer, direction);
        this.indexState(forwardIndex) == player;
        forwardIndex = this.iterateForward(forwardIndex, direction)) {
        count++;
    } 

    //Backwards pass
    for(let backIndex = this.iterateForward(indexer, backDirection);
        this.indexState(backIndex) == player;
        backIndex = this.iterateForward(backIndex, backDirection)) {
        count++;
    } 
    
    return count;
}

Connect4Manager.prototype.indexState = function(indexer)
{
    if(indexer[0] >= gameRows || indexer[0] < 0 || 
        indexer[1] >= gameColumns || indexer[1] < 0 ||
        indexer[2] >= gameMaxStack || indexer[2] < 0 )
        return undefined;
    return this.gameState[indexer[0]][indexer[1]][indexer[2]];
}

Connect4Manager.prototype.iterateForward = function(indexer, direction)
{
    let newIndexer = [indexer[0], indexer[1], indexer[2]]
    newIndexer[0] += direction[0];
    newIndexer[1] += direction[1];
    newIndexer[2] += direction[2];
    return newIndexer;
}