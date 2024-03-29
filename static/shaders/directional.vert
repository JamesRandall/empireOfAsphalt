#version 300 es
precision highp int;
precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec2 aTextureCoord;
in vec4 aTileId;
in vec4 aObjectInfo;
in vec4 aAdditionalObjectInfo;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out highp vec4 vColor;
out highp vec4 vTileId;
out highp vec3 vNormal;
out highp vec2 vTextureCoord;
out highp vec4 vTileInfo;
out highp vec4 vAdditionalTileInfo;

void main(void) {
    vNormal = mat3(uModelViewMatrix) * aVertexNormal;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vColor = aVertexColor;
    vTileId = aTileId;
    vTileInfo = aObjectInfo;
    vAdditionalTileInfo = aAdditionalObjectInfo;
}

