#version 300 es

precision mediump float;

in vec2 uvFS;
in vec3 fs_norm;
in vec3 fs_pos;
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

void main() {
  vec3 pointLightDistance = pointLightPosition - fs_pos;
  vec3 pointLightDir = normalize(pointLightDistance);
	float t = reductionDistance / length(pointLightDistance);
	vec3 pointLightFColor = pointLightColor * pow(t, pointLightDecay);

  vec3 normalVec = normalize(fs_norm);
  vec3 ambientColor = texture(ambientCubemap, normalVec).xyz * ambientIntensity;

  vec3 directionalLambertColor = clamp(dot(directionalLightDir, normalVec),0.0,1.0) * directionalLightColor;
  vec3 pointLambertColor = clamp(dot(pointLightDir, normalVec),0.0,1.0) * pointLightFColor;
  vec3 diffColor = texture(mainTexture, uvFS).xyz;
	outColor = vec4(clamp(diffColor * (directionalLambertColor + pointLambertColor) + ambientColor, 0.0, 1.0), 1.0);
}