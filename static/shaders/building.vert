#version 300 es
precision highp int;
precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out highp vec4 vColor;
out highp vec3 vNormal;

void main(void) {
    vNormal = mat3(uModelViewMatrix) * aVertexNormal;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
}

