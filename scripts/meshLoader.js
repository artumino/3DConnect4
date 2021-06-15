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

    getClone = function(mesh) {
        var clone = new Mesh();
        clone.copyFrom(mesh);
        return clone;
    }

    getBaseClone = function() {
        return getClone(base);
    }

    getPieceClone = function() {
        return getClone(piece);
    }
}