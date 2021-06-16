
// 3 component vector
normalize = function(v)
{
    let len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

computeVersor = function(from, to)
{
    let diff = [to[0]-from[0], to[1]-from[1], to[2]-from[2]];
    return normalize(diff);
}

distance = function(from, to)
{
    let v = [to[0]-from[0], to[1]-from[1], to[2]-from[2]];
    return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}