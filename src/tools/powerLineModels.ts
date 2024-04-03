import { addBuildingToGame, Game, removeBuildingFromGame } from "../model/game"
import { Resources } from "../resources/resources"
import { LandscapeTexture, ZoneEnum } from "../model/Landscape"
import { getZonePattern, isMatchingPattern, tilePatterns } from "./tilePatterns"
import { updateRendererTileInfo } from "../resources/landscape"
import { Building, createBuilding } from "../model/building"

const patterns = [
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineNorthSouth, pattern: tilePatterns.northSouth },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineEastWest, pattern: tilePatterns.eastWest },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineNorthEast, pattern: tilePatterns.northEast },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineNorthWest, pattern: tilePatterns.northWest },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineNorthT, pattern: tilePatterns.northT },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineWestT, pattern: tilePatterns.westT },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineSouthEast, pattern: tilePatterns.southEast },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineSouthWest, pattern: tilePatterns.southWest },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineEastT, pattern: tilePatterns.eastT },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineSouthT, pattern: tilePatterns.southT },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineCrossRoads, pattern: tilePatterns.crossroads },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineNorthSouth, pattern: tilePatterns.northStub },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineNorthSouth, pattern: tilePatterns.southStub },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineEastWest, pattern: tilePatterns.westStub },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineEastWest, pattern: tilePatterns.eastStub },
  { voxelModelBuilder: (r: Resources) => r.voxelModels.power.powerLineNorthSouth, pattern: tilePatterns.isolate },
]

function getPowerlinePattern(game: Game, x: number, y: number) {
  return getZonePattern(game, x, y, ZoneEnum.PowerLine)
}

function getModelBuilderForPattern(pattern: number[][]) {
  for (const roadPattern of patterns) {
    if (isMatchingPattern(pattern, roadPattern.pattern)) {
      return roadPattern.voxelModelBuilder
    }
  }
}

export function applyPowerlineModels(
  gl: WebGL2RenderingContext,
  game: Game,
  resources: Resources,
  r: { top: number; left: number; bottom: number; right: number },
) {
  for (let x = r.left - 1; x <= r.right + 1; x++) {
    for (let y = r.top - 1; y <= r.bottom + 1; y++) {
      if (x < 0 || x >= game.landscape.size || y < 0 || y >= game.landscape.size) continue
      // only have the one texture for now
      const tileInfo = game.landscape.tileInfo[y][x]
      if (tileInfo.zone === ZoneEnum.PowerLine) {
        if (tileInfo.building) {
          removeBuildingFromGame(game, tileInfo.building)
          tileInfo.building = undefined
        }
        const pattern = getPowerlinePattern(game, x, y)
        const builder = getModelBuilderForPattern(pattern)
        if (builder) {
          const model = builder(resources)
          const building = createBuilding(model, 1, 1, x, y, model.voxelCount)
          addBuildingToGame(game, building)
          tileInfo.building = building
        }
      }
    }
  }

  const range = { start: { x: r.left - 1, y: r.top - 1 }, end: { x: r.right + 1, y: r.bottom + 1 } }
  updateRendererTileInfo(gl, game.landscape, range)
}