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
    this.gameScene  = new Scene();

    var cameraPivot = new Entity("CameraPivot");
    var mainCamera = new Camera("Main Camera");
    mainCamera.setParent(cameraPivot);
    mainCamera.move(0, 12, -20);
    mainCamera.setLocalEulerRotation(0, -30, 0);
    this.gameBoard = new DrawableEntity("GameBoard", {
        mainTexture: new Texture("WoodM1.jpg")
    }, meshLoader.base, Shader.getShader("ubershader"));

    this.gameScene.addEntity(cameraPivot);
    this.gameScene.addEntity(mainCamera);
    this.gameScene.addEntity(this.gameBoard);

    cameraPivot.addComponent({
        enabled: true,
        update: function(object, deltaTime)
        {
            object.rotate(Quaternion.fromEuler(0, 0, 1*deltaTime, 'XZY'));
        }
    });

    let connectManager = this;
    cameraPivot.addComponent({
        enabled: true,
        time: 0.0,
        lastInsertion: [0, 0],
        player: 0,
        update: function(object, deltaTime)
        {
            this.time += deltaTime;
            if(this.time > 5)
            {
                connectManager.dropPiece(this.player++ % 2, this.lastInsertion[0], this.lastInsertion[1]);
                if(this.lastInsertion[1]++ % gameColumns == 0)
                {
                    this.lastInsertion[1] = 0;
                    if(this.lastInsertion[0]++ % gameRows == 0)
                        this.lastInsertion[0] = 0;
                }
                this.time = 0;
            }
        }
    });

    this.gameScene.init();
    this.gameEngine.loadScene(this.gameScene);
}

Connect4Manager.prototype.dropPiece = function(player, row, column)
{
    console.log("Dropping " + player + " into " + row + "," + column);
    var designedStack = this.gameState[row][column];
    if(this.gameScene && designedStack && designedStack.length < gameMaxStack)
    {
        const depth = designedStack.push(player);
        const pawnBoardCoordinates = this.fromStateToBoardCoords(row, column, depth);
        const startPosition = [pawnBoardCoordinates[0], 10, pawnBoardCoordinates[2]];
        const animationDelta = [startPosition[0] - pawnBoardCoordinates[0],
                     startPosition[1] - pawnBoardCoordinates[1],
                     startPosition[2] - pawnBoardCoordinates[2]]


        let pawn = new DrawableEntity("Pawn_" + row + "_" + column + "_" + depth, {
            mainTexture: Texture.getOrCreate(player == 1 ? "WoodD1.jpg" : "WoodL1.png")
        }, meshLoader.piece, Shader.getShader("ubershader"));
        pawn.setParent(this.gameBoard);
        pawn.setLocalPosition(startPosition[0], startPosition[1], startPosition[2]);

        let pawnLerper = {
            enabled: true,
            time: 0.0,
            duration: 1.0,
            update: function(object, deltaTime)
            {
                this.time += deltaTime;
                let interpolationFactor = Math.min(0, Math.max(1, this.time / this.duration));
                object.setLocalPosition(startPosition[0] + animationDelta[0]*interpolationFactor,
                    startPosition[1] + animationDelta[1]*interpolationFactor,
                    startPosition[2] + animationDelta[2]*interpolationFactor);

                if(interpolationFactor == 1)
                {
                    this.enabled = false;
                    object.removeComponent(pawnLerper);
                }
            }
        };
        pawn.addComponent(pawnLerper);
        pawn.init();
        this.gameScene.addEntity(pawn);
    }
}

Connect4Manager.prototype.fromStateToBoardCoords = function(i, j, depth)
{
    return [-2 + i*1.5, 1 + depth*1.5,-2 + j*1.5]
}

Connect4Manager.prototype.processWinCondition = function()
{

}