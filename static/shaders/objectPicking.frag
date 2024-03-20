#version 300 es
precision highp int;
precision highp float;

in lowp vec4 vColor;
out lowp vec4 outputColor;

void main(void) {
    outputColor = vColor;
}