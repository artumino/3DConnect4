var meshLoader =
{
    base: undefined,
    piece: undefined,
    pawnDropSelector: undefined,
    init: async function() {
        this.base = new Mesh();
        await this.base.loadObj("assets/base.obj");

        this.piece = new Mesh();
        await this.piece.loadObj("assets/piece_fixed.obj");

        this.pawnDropSelector = new Mesh();
        await this.pawnDropSelector.loadObj("assets/pawn_drop_selector.obj");
    }
};