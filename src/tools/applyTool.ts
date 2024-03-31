import { Game } from "../model/game"
import { rectFromRange } from "../utilities"
import { LandscapeTexture, ZoneEnum } from "../model/Landscape"
import { updateRendererTileInfo } from "../resources/landscape"
import { canApplyZoneToTile, isZoningTool, zoneForTool } from "./utilities"

export function applyTool(gl: WebGL2RenderingContext, game: Game) {
  if (isZoningTool(game.gui.currentTool) && game.gui.selection !== null) {
    applyZoning(gl, game)
  }
}

function applyZoning(gl: WebGL2RenderingContext, game: Game) {
  const newZone = zoneForTool(game.gui.currentTool)
  const r = rectFromRange(game.gui.selection!)

  for (let x = r.left; x <= r.right; x++) {
    for (let y = r.top; y <= r.bottom; y++) {
      if (canApplyZoneToTile(game.gui.currentTool, game.landscape.tileInfo[y][x])) {
        if (game.landscape.tileInfo[y][x].zone !== newZone) {
          // TODO: delete buildings etc.
        }
        game.landscape.tileInfo[y][x].zone = newZone
      }
    }
  }

  // We have to apply the road textures after we've laid the road down as they impact each other and their neighbours
  if (newZone === ZoneEnum.Road) {
    applyRoadTextures(gl, game, r)
  } else {
    updateRendererTileInfo(gl, game.landscape, game.gui.selection!)
  }
}

const northSouth = [
  [0, 1, 0],
  [0, 0, 0],
  [0, 1, 0],
]
const eastWest = [
  [0, 0, 0],
  [1, 0, 1],
  [0, 0, 0],
]
const northEast = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
]
const northWest = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
]
const northToEastWest = [
  [0, 0, 0],
  [1, 0, 1],
  [0, 1, 0],
]
const westToNorthSouth = [
  [0, 1, 0],
  [1, 0, 0],
  [0, 1, 0],
]
const southWest = [
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 0],
]
const southEast = [
  [0, 1, 0],
  [0, 0, 1],
  [0, 0, 0],
]
const eastToNorthSouth = [
  [0, 1, 0],
  [0, 0, 1],
  [0, 1, 0],
]
const southToEastWest = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 0, 0],
]
const crossroads = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 1, 0],
]
const northStub = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 1, 0],
]
const southStub = [
  [0, 1, 0],
  [0, 0, 0],
  [0, 0, 0],
]
const westStub = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 0, 0],
]
const eastStub = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 0, 0],
]
const isolate = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
]

const roadPatterns = [
  { type: LandscapeTexture.RoadNorthSouth, pattern: northSouth },
  { type: LandscapeTexture.RoadEastWest, pattern: eastWest },
  { type: LandscapeTexture.RoadNorthEast, pattern: northEast },
  { type: LandscapeTexture.RoadNorthWest, pattern: northWest },
  { type: LandscapeTexture.RoadNorthSouth, pattern: northSouth },
  { type: LandscapeTexture.RoadNorthToEastWest, pattern: northToEastWest },
  { type: LandscapeTexture.RoadWestToNorthSouth, pattern: westToNorthSouth },
  { type: LandscapeTexture.RoadSouthEast, pattern: southEast },
  { type: LandscapeTexture.RoadSouthWest, pattern: southWest },
  { type: LandscapeTexture.RoadEastTNorthSouth, pattern: eastToNorthSouth },
  { type: LandscapeTexture.RoadSouthTEastWest, pattern: southToEastWest },
  { type: LandscapeTexture.RoadCrossroads, pattern: crossroads },
  { type: LandscapeTexture.RoadNorthStub, pattern: northStub },
  { type: LandscapeTexture.RoadSouthStub, pattern: southStub },
  { type: LandscapeTexture.RoadWestStub, pattern: westStub },
  { type: LandscapeTexture.RoadEastStub, pattern: eastStub },
  { type: LandscapeTexture.RoadIsolate, pattern: isolate },
]

function getRoadPattern(game: Game, x: number, y: number) {
  const tileInfos = game.landscape.tileInfo

  const pattern = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  if (y > 0) {
    pattern[0][1] = tileInfos[y - 1][x].zone === ZoneEnum.Road ? 1 : 0
  }
  if (y < game.landscape.size - 1) {
    pattern[2][1] = tileInfos[y + 1][x].zone === ZoneEnum.Road ? 1 : 0
  }
  if (x > 0) {
    pattern[1][0] = tileInfos[y][x - 1].zone === ZoneEnum.Road ? 1 : 0
  }
  if (x < game.landscape.size - 1) {
    pattern[1][2] = tileInfos[y][x + 1].zone === ZoneEnum.Road ? 1 : 0
  }
  return pattern

  /*
  const rows:number[][] = []
  for(let ty=y-1; ty <= y+1; ty++) {
    if (ty < 0 || ty >= tileInfos.length) {
      rows.push([0,1,0])
    }
    else {
      const tir = tileInfos[ty]
      for (let tx = x - 1; tx <= x + 1; tx++) {
        rows.push([
          tx < 0 ? 0 : (tir[tx].zone === ZoneEnum.Road ? 1 : 0),
          (tir[tx].zone === ZoneEnum.Road ? 1 : 0),
          tx >= tir.length ? 0 : ((tir[tx].zone === ZoneEnum.Road ? 1 : 0))
        ])
      }
    }
  }
  return rows;*/
}

function getTextureForPattern(pattern: number[][]) {
  for (const roadPattern of roadPatterns) {
    if (
      pattern[0][1] === roadPattern.pattern[2][1] &&
      pattern[1][0] === roadPattern.pattern[1][0] &&
      pattern[1][2] === roadPattern.pattern[1][2] &&
      pattern[2][1] === roadPattern.pattern[0][1]
    ) {
      return roadPattern.type
    }
  }
}

function applyRoadTextures(
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
