#version 300 es

in vec3 inPosition0;
in vec3 inNormal0;
in vec2 inUV0;
out vec2 uvFS;
out vec3 fs_pos;
out vec3 fs_norm;

uniform mat4 matrix_MVP;
uniform mat4 matrix_N;
uniform mat4 matrix_W;

void main() {
  uvFS = inUV0;
  fs_norm = mat3(matrix_N) * inNormal0;
  fs_pos = (matrix_W * vec4(inPosition0, 1.0)).xyz;
  gl_Position = matrix_MVP * vec4(inPosition0, 1.0);
}