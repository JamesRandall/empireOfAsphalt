#version 300 es
precision highp int;
precision highp float;


in highp vec4 vColor;
in highp vec3 vNormal;
in highp vec2 vTextureCoord;
in highp vec4 vTileId;
// the components carry different information about the tile
//  r - the terrain type (TerrainTypeEnum)
//  g - the zone type (ZoneEnum)
in highp vec4 vTileInfo;

uniform vec3 uLightWorldPosition;
uniform vec4 uLineColor;
uniform highp float uZoomedTileSize;
uniform highp vec4 uSelectedTileId;
uniform int uRangeLeft;
uniform int uRangeTop;
uniform int uRangeRight;
uniform int uRangeBottom;
uniform int uMapSize;

out lowp vec4 outputColor;

float modI(float a,float b) {
    float m=a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

int objectIdFromVector(vec4 objectVec) {
    return int(objectVec.r*255.0) + (int(objectVec.g*255.0) << 8) + (int(objectVec.b*255.0) << 16) + (int(objectVec.a*255.0) << 24);
}

int getXFromObjectId(int objectId) {
    return int(modI(float(objectId),float(uMapSize)));
}

int getYFromObjectId(int objectId) {
    return objectId / uMapSize;
}

void main(void) {
    float lineThickness = 1.0;
    vec4 zoneColor = vec4(0.0,0.0,0.0,0.0);
    vec4 color;
    int iTileId = objectIdFromVector(vTileId);
    int tileX = getXFromObjectId(iTileId);
    int tileY = getYFromObjectId(iTileId);
    vec4 lineColor = uLineColor;

    if (vTileInfo.g == 1.0) {
        color = vColor + vec4(1.0, 0.0, 0.0, 1.0);
        lineThickness = 2.0;
    }
    else {
        if (tileX >= uRangeLeft && tileX <= uRangeRight && tileY >= uRangeTop && tileY <= uRangeBottom) {
            color = vec4(0.7,0.0,0.0,1.0);
            //lineThickness = 4.0;
        }
        else {
            color = vColor;
        }
    }
    float borderSize = lineThickness/uZoomedTileSize;
    if (vTextureCoord.x < borderSize || vTextureCoord.y < borderSize || vTextureCoord.x > (1.0-borderSize) || vTextureCoord.y > (1.0-borderSize)) {
        outputColor = lineColor;
    }
    else {
        vec3 normal = normalize(vNormal);
        float light = dot(normal, normalize(uLightWorldPosition)*-1.0);
        //light = (0.6 * light) + 0.4; // this makes the light range from "mid" to bright
        outputColor = color;
        outputColor.rgb *= (light+0.6);
    }
}