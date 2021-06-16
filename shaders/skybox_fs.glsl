#version 300 es

precision mediump float;

in vec3 sampleDir;
 
uniform samplerCube mainTexture;
uniform mat4 imatrix_VP;

out vec4 outColor;
 
void main() {
    vec4 p = imatrix_VP*vec4(sampleDir, 1.0);
    
    vec4 rgba = texture(mainTexture, normalize(p.xyz / p.w));
    
    outColor = vec4(rgba.rgb, 1.0);
}