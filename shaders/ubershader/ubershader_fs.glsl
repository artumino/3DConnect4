#version 300 es

precision mediump float;

in vec2 uvFS;
in vec3 normalVector;
out vec4 outColor;
uniform sampler2D mainTexture;
uniform samplerCube ambientCubemap;
uniform float ambientIntensity;
uniform vec3 directionalLightDir;
uniform vec3 directionalLightColor;

void main() {
  vec3 normalVec = normalVector;
  vec3 ambientColor = texture(ambientCubemap, normalVec).xyz * ambientIntensity;
  vec3 lambertColor = clamp(dot(directionalLightDir, normalVec),0.0,1.0) * directionalLightColor + ambientColor;
  vec4 diffColor = texture(mainTexture, uvFS);
	outColor = clamp(diffColor * vec4(lambertColor, 1.0), 0.0, 1.0);
}