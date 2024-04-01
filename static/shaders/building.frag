#version 300 es
precision highp int;
precision highp float;

in highp vec4 vColor;
in highp vec3 vNormal;
uniform vec3 uLightWorldPosition;
out lowp vec4 outputColor;

void main(void) {
    vec4 color = vColor;
    vec4 minColor = vColor*0.3;
    vec3 normal = normalize(vNormal);
    float light = dot(normal, normalize(uLightWorldPosition)*-1.0);
    //light = (0.6 * light) + 0.4; // this makes the light range from "mid" to bright
    outputColor = color;
    outputColor.rgb *= (light+0.6);
    outputColor = max(outputColor, minColor);
}