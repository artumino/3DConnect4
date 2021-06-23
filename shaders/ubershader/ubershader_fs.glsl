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

uniform vec3 pointLightPosition;
uniform float reductionDistance;
uniform vec3 pointLightColor;
uniform float pointLightDecay;
in vec3 fs_pos;

void main() {
  vec3 pointLightDir = normalize(pointLightPosition - fs_pos);
	float t = reductionDistance / length(pointLightPosition - fs_pos);
	vec3 pointLightFColor = pointLightColor * pow(t, pointLightDecay);

  vec3 normalVec = normalize(normalVector);
  vec3 ambientColor = texture(ambientCubemap, normalVec).xyz * ambientIntensity;

  vec3 directionalLambertColor = clamp(dot(directionalLightDir, normalVec),0.0,1.0) * directionalLightColor + ambientColor;
  vec3 pointLambertColor = clamp(dot(pointLightDir, normalVec),0.0,1.0) * pointLightFColor + ambientColor;
  vec4 diffColor = texture(mainTexture, uvFS);
	outColor = clamp(diffColor * (directionalLambertColor + pointLambertColor), 0.0, 1.0);
}