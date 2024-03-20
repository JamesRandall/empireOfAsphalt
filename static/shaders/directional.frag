#version 300 es
precision highp int;
precision highp float;

in lowp vec4 vColor;
in highp vec3 vNormal;
in highp vec2 vTextureCoord;
uniform vec3 uLightWorldPosition;
uniform vec4 uLineColor;
uniform highp float uZoomedTileSize;

out lowp vec4 outputColor;

void main(void) {
    float borderSize = 1.0/uZoomedTileSize;
    if (vTextureCoord.x < borderSize || vTextureCoord.y < borderSize || vTextureCoord.x > (1.0-borderSize) || vTextureCoord.y > (1.0-borderSize)) {
        outputColor = uLineColor;
    }
    else {
        vec3 normal = normalize(vNormal);
        float light = dot(normal, normalize(uLightWorldPosition)*-1.0);
        //light = (0.6 * light) + 0.4; // this makes the light range from "mid" to bright
        outputColor = vColor;
        outputColor.rgb *= (light+0.6);
    }
}