#version 300 es
precision highp int;
precision highp float;

in lowp vec4 vColor;
out lowp vec4 outputColor;

void main(void) {
    //outputColor = vec4(0.0, 0.0, 0.0, 0.0); //vColor;
    //outputColor = vec4(vColor.xyz, 1.0); //vColor;
    //outputColor = vec4(0.0,0.0,0.0, 1.0); //vColor;
    outputColor = vColor;
}