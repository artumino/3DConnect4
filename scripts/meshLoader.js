var meshLoader = function() 
{
    base = {};
    piece = {};

    init = function() {
        base = Mesh();
        base.loadObj("assets/base.obj");
        piece = Mesh();
        piece.loadObj("assets/piece_fixed.obj");
    }

    bindBase = function(mesh) {
        mesh.copyFrom(base);
    }

    bindPiece = function(mesh) {
        mesh.copyFrom(piece);
    }
}