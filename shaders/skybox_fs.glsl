#version 300 es

precision mediump float;

in vec3 sampleDir;
 
uniform samplerCube mainTexture;
uniform mat4 imatrix_VP;
uniform int blurFactor;

out vec4 outColor;
 
void main() {
    vec4 p = imatrix_VP*vec4(sampleDir, 1.0);
    
    vec4 rgba = texture(mainTexture, normalize(p.xyz / p.w));
    float epsilon = 0.0025;

    for(int i = 0; i < blurFactor; i++)
    {
        rgba += texture(mainTexture, normalize((p.xyz + vec3(epsilon))/ p.w));
        rgba += texture(mainTexture, normalize((p.xyz - vec3(epsilon))/ p.w));
        epsilon += 0.0025;
    }
    
    float smoothingFactor = 1.0 / float(blurFactor*2 + 1);
    outColor = vec4(rgba.rgb*smoothingFactor, 1.0);
}