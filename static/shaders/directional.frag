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
// r - the index of the texture (we will use this to pick a slice out of a tileset texture)
in highp vec4 vAdditionalTileInfo;

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

vec4 zoneColor(int zoneType, vec4 defaultColor) {
    const int lightResidential = 1;
    const int denseResidential = 2;
    const int lightCommercial = 3;
    const int denseCommercial = 4;
    const int lightIndustrial = 5;
    const int denseIndustrial = 6;

    switch (zoneType) {
        case lightResidential: return vec4(128.0/255.0, 177.0/255.0, 121.0/255.0, 1.0);
        case denseResidential: return vec4(33.0/255.0, 179.0/255.0, 13.0/255.0, 1.0);
        case lightCommercial: return vec4(119.0/255.0, 150.0/255.0, 218.0/255.0, 1.0);
        case denseCommercial: return vec4(36.0/255.0, 91.0/255.0, 209.0/255.0, 1.0);
        case lightIndustrial: return vec4(230.0/255.0, 229.0/255.0, 149.0/255.0, 1.0);
        case denseIndustrial: return vec4(216.0/255.0, 212.0/255.0, 72.0/255.0, 1.0);
    }
    return defaultColor;
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
    const int texturesAcross = 4;
    const int texturesDown = 4;
    const int textureSize = 128;
    const float textureScaleX = 1.0 / float(texturesAcross);
    const float textureScaleY = 1.0 / float(texturesDown);
    int textureIndex = int(vAdditionalTileInfo.r) - 1;
    float textureRow = float(textureIndex / texturesAcross);
    float textureColumn = modI(float(textureIndex), float(texturesAcross));
    float textureX = textureColumn * (1.0 / float(texturesAcross));
    float textureY = textureRow * (1.0 / float(texturesDown));

    float lineThickness = 1.0;
    vec4 color;
    int iTileId = objectIdFromVector(vTileId);
    int tileX = getXFromObjectId(iTileId);
    int tileY = getYFromObjectId(iTileId);
    vec4 lineColor = uLineColor;

    vec2 vTextureSliceCoord = vec2(textureX + vTextureCoord.x * textureScaleX, textureY + vTextureCoord.y * textureScaleY);
    vec4 tex = texture(uTextureSampler, vTextureSliceCoord);

    // this colors the tile with the selection color if the tile is in the selection range
    // and we are allowing sloped tiles to be selected or the tile is flat
    if (tileX >= uRangeLeft && tileX <= uRangeRight && tileY >= uRangeTop && tileY <= uRangeBottom && (uAllowRangeOnSloped || vTileInfo.b == 1.0)) {
        color = vec4(0.7,0.0,0.0,1.0);
    }
    else {
        if (textureIndex >= 0 && tex.a == 1.0) {
            color = tex;
        }
        else {
            color = zoneColor(int(vTileInfo.g), vColor);
        }
    }

    float borderSize = lineThickness/uZoomedTileSize;
    if ((vTextureCoord.x < borderSize || vTextureCoord.y < borderSize || vTextureCoord.x > (1.0-borderSize) || vTextureCoord.y > (1.0-borderSize)) && (vAdditionalTileInfo.r == 0.0 || tex.a == 0.0)) {
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