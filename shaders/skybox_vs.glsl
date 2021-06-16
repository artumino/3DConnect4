#version 300 es

in vec3 inPosition0;
     
out vec3 sampleDir;
     
void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4(inPosition0,1.0);
 
  // Pass a normal. Since the positions are
  // centered around the origin we can just 
  // pass the position
  sampleDir = inPosition0;
}