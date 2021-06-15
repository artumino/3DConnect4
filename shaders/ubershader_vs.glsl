#version 300 es

in vec3 inPosition0;
in vec2 inUV0;
out vec2 uvFS;

uniform mat4 matrix_MVP; 
void main() {
  uvFS = inUV0;
  gl_Position = matrix_MVP * vec4(inPosition0, 1.0);
}