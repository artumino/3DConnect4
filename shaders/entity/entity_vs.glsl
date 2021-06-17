#version 300 es

in vec3 inPosition0;
uniform mat4 matrix_MVP; 

void main() {
  gl_Position = matrix_MVP * vec4(inPosition0, 1.0);
}