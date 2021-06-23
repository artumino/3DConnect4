var Ray = function(origin, direction)
{
    this.origin = origin;
    this.direction = direction;
}

Ray.prototype.toPoint = function(t)
{
    return [
        this.origin[0] + t*this.direction[0],
        this.origin[1] + t*this.direction[1],
        this.origin[2] + t*this.direction[2]
    ];
}

var BoundingBox = function(vertexMin, vertexMax)
{
    //Used for AABB raycasting
    this.vertexMin = vertexMin;
    this.vertexMax = vertexMax;
    this.worldVMin = undefined;
    this.worldVMax = undefined;
}

BoundingBox.prototype.intersect = function(ray)
{
    //AABB Raycast intersection with tMin returned or undefined
    var t1 = (this.worldVMin[0] - ray.origin[0])/ray.direction[0];
    var t2 = (this.worldVMax[0] - ray.origin[0])/ray.direction[0];     

    var tmin = Math.min(t1, t2);
    var tmax = Math.max(t1, t2);

    //Find the maximum of the minimums and the minimuim of the maximums over all directions
    for (var i = 1; i < 3; ++i) {
        t1 = (this.worldVMin[i] - ray.origin[i])/ray.direction[i];
        t2 = (this.worldVMax[i] - ray.origin[i])/ray.direction[i];

        tmin = Math.max(tmin, Math.min(t1, t2));
        tmax = Math.min(tmax, Math.max(t1, t2));
    }

    //Check intersection conditions
    if (tmax < 0) return undefined; // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
    if (tmin > tmax) return undefined; // if tmin > tmax, ray doesn't intersect AABB
    if (tmin < 0) return tmax;
    return tmin;
}

BoundingBox.prototype.updateWorldBounds = function(worldMatrix)
{
    //Projects the bound vertices to world coordinates
    let worldVertexMin = utils.multiplyMatrixVector(worldMatrix, [this.vertexMin[0], this.vertexMin[1], this.vertexMin[2], 1.0]);
    let worldVertexMax = utils.multiplyMatrixVector(worldMatrix, [this.vertexMax[0], this.vertexMax[1], this.vertexMax[2], 1.0]);
    this.worldVMin = [worldVertexMin[0]/worldVertexMin[3], worldVertexMin[1]/worldVertexMin[3], worldVertexMin[2]/worldVertexMin[3]];
    this.worldVMax = [worldVertexMax[0]/worldVertexMax[3], worldVertexMax[1]/worldVertexMax[3], worldVertexMax[2]/worldVertexMax[3]];
}