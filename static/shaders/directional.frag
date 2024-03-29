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
//  b - is flat, > 0 = flat, 0 == hilly
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
uniform bool uAllowRangeOnSloped;
uniform sampler2D uTextureSampler;

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
    const float zoneNone = 0.0;
    const float zoneLightResidential = 1.0;
    const float zoneDenseResidential = 2.0;
    const float zoneLightCommercial = 3.0;
    const float zoneDenseCommercial = 4.0;
    const float zoneLightIndustrial = 5.0;
    const float zoneDenseIndustrial = 6.0;
    const float zoneRoad = 7.0;

    vec4 tex = texture(uTextureSampler, vTextureCoord);
    float lineThickness = 1.0;
    vec4 zoneColor = vec4(0.0,0.0,0.0,0.0);
    vec4 color;
    int iTileId = objectIdFromVector(vTileId);
    int tileX = getXFromObjectId(iTileId);
    int tileY = getYFromObjectId(iTileId);
    vec4 lineColor = uLineColor;

    // this colors the tile with the selection color if the tile is in the selection range
    // and we are allowing sloped tiles to be selected or the tile is flat
    if (tileX >= uRangeLeft && tileX <= uRangeRight && tileY >= uRangeTop && tileY <= uRangeBottom && (uAllowRangeOnSloped || vTileInfo.b == 1.0)) {
        color = vec4(0.7,0.0,0.0,1.0);
        //lineThickness = 4.0;
    }
    else {
        if (vTileInfo.g == 0.0) {
            color = vColor; // not zoned
        }
        else {
            color = vec4(0.0, 0.7, 0.0, 1.0); // color based on zone type
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