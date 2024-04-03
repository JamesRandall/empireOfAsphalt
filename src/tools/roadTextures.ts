import { LandscapeTexture, ZoneEnum } from "../model/Landscape"
import { Game } from "../model/game"
import { updateRendererTileInfo } from "../resources/landscape"
import { getZonePattern, isMatchingPattern, tilePatterns } from "./tilePatterns"

const roadPatterns = [
  { type: LandscapeTexture.RoadNorthSouth, pattern: tilePatterns.northSouth },
  { type: LandscapeTexture.RoadEastWest, pattern: tilePatterns.eastWest },
  { type: LandscapeTexture.RoadNorthEast, pattern: tilePatterns.northEast },
  { type: LandscapeTexture.RoadNorthWest, pattern: tilePatterns.northWest },
  { type: LandscapeTexture.RoadNorthToEastWest, pattern: tilePatterns.northT },
  { type: LandscapeTexture.RoadWestToNorthSouth, pattern: tilePatterns.westT },
  { type: LandscapeTexture.RoadSouthEast, pattern: tilePatterns.southEast },
  { type: LandscapeTexture.RoadSouthWest, pattern: tilePatterns.southWest },
  { type: LandscapeTexture.RoadEastTNorthSouth, pattern: tilePatterns.eastT },
  { type: LandscapeTexture.RoadSouthTEastWest, pattern: tilePatterns.southT },
  { type: LandscapeTexture.RoadCrossroads, pattern: tilePatterns.crossroads },
  { type: LandscapeTexture.RoadNorthStub, pattern: tilePatterns.northStub },
  { type: LandscapeTexture.RoadSouthStub, pattern: tilePatterns.southStub },
  { type: LandscapeTexture.RoadWestStub, pattern: tilePatterns.westStub },
  { type: LandscapeTexture.RoadEastStub, pattern: tilePatterns.eastStub },
  { type: LandscapeTexture.RoadIsolate, pattern: tilePatterns.isolate },
]

function getRoadPattern(game: Game, x: number, y: number) {
  return getZonePattern(game, x, y, ZoneEnum.Road)
}

function getTextureForPattern(pattern: number[][]) {
  for (const roadPattern of roadPatterns) {
    if (isMatchingPattern(pattern, roadPattern.pattern)) {
      return roadPattern.type
    }
  }
}

export function applyRoadTextures(
  gl: WebGL2RenderingContext,
  game: Game,
  r: { top: number; left: number; bottom: number; right: number },
) {
  for (let x = r.left - 1; x <= r.right + 1; x++) {
    for (let y = r.top - 1; y <= r.bottom + 1; y++) {
      if (x < 0 || x >= game.landscape.size || y < 0 || y >= game.landscape.size) continue
      // only have the one texture for now
      if (game.landscape.tileInfo[y][x].zone === ZoneEnum.Road) {
        const pattern = getRoadPattern(game, x, y)
        game.landscape.tileInfo[y][x].textureIndex = getTextureForPattern(pattern) ?? null
      }
    }
  }

  const range = { start: { x: r.left - 1, y: r.top - 1 }, end: { x: r.right + 1, y: r.bottom + 1 } }
  updateRendererTileInfo(gl, game.landscape, range)
}
