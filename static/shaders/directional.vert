#version 300 es
precision highp int;
precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out lowp vec4 vColor;
out highp vec3 vNormal;
out highp vec2 vTextureCoord;
//out highp vec3 v_surfaceToLight;

void main(void) {
    vNormal = mat3(uModelViewMatrix) * aVertexNormal;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vColor = aVertexColor;
}