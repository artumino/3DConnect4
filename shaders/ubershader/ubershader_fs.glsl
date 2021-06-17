#version 300 es

precision mediump float;

in vec2 uvFS;
out vec4 outColor;
uniform sampler2D mainTexture;

void main() {
  outColor = texture(mainTexture, uvFS);
}