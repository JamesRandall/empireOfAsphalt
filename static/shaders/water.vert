#version 300 es
precision highp int;
precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec4 aObjectInfo;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uZoom;
uniform float uTileSize;
uniform float uVoxelsPerTile;
uniform float uWaveOffset;
out highp vec4 vColor;
out highp vec3 vNormal;

const float PI = 3.141592656;
const float fullRadians = PI * 2.0;
const float radiansPerWaveUnit = fullRadians / 8.0;

void main(void) {
    vec4 translatedVertexPosition = vec4(aVertexPosition);
    if (aObjectInfo.r >= 0.0) {
        float waveOffset = mod(aObjectInfo.r + uWaveOffset, 8.0);
        float unitSize = uTileSize / uVoxelsPerTile;
        float waveHeight = unitSize * (1.0+sin(radiansPerWaveUnit * waveOffset))/2.0;
        translatedVertexPosition.y -= unitSize - (unitSize/4.0);
        translatedVertexPosition.y += waveHeight;
    }


    vNormal = mat3(uModelViewMatrix) * aVertexNormal;
    gl_Position = uProjectionMatrix * uModelViewMatrix * translatedVertexPosition;
    vColor = aVertexColor;
}

