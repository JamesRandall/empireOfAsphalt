import { Game } from "../model/game"
import { Resources } from "../resources/resources"
import { getPattern, isMatchingPattern, tilePatterns } from "./tilePatterns"
import { updateRendererTileInfo } from "../resources/landscape"
import { blueprintForBuilding, BuildingType, createBuilding } from "../model/building"
import { ElevatedZoneEnum, LandscapeTexture, ZoneEnum } from "../model/Tile"
import { addBuildingToSimulation, removeBuildingFromSimulation } from "../simulation/buildings"

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
  return getPattern(
    game,
    x,
    y,
    (ti) => ti.elevatedZone === ElevatedZoneEnum.PowerLine || ti.zone === ZoneEnum.CoalPowerPlant,
  )
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
  const powerlineBlueprint = blueprintForBuilding(BuildingType.PowerLine)!
  for (let x = r.left - 1; x <= r.right + 1; x++) {
    for (let y = r.top - 1; y <= r.bottom + 1; y++) {
      if (x < 0 || x >= game.simulation.landscape.size || y < 0 || y >= game.simulation.landscape.size) continue
      // only have the one texture for now
      const tileInfo = game.simulation.landscape.tileInfo[y][x]
      if (tileInfo.elevatedZone === ElevatedZoneEnum.PowerLine) {
        if (tileInfo.building) {
          removeBuildingFromSimulation(game.simulation, tileInfo.building)
          tileInfo.building = null
        }
        const pattern = getPowerlinePattern(game, x, y)
        const builder =
          tileInfo.zone === ZoneEnum.Road && tileInfo.textureIndex === LandscapeTexture.RoadNorthSouth
            ? (r: Resources) => r.voxelModels.power.powerLineRoadEastWest
            : tileInfo.zone === ZoneEnum.Road && tileInfo.textureIndex === LandscapeTexture.RoadEastWest
              ? (r: Resources) => r.voxelModels.power.powerLineRoadNorthSouth
              : getModelBuilderForPattern(pattern)
        if (builder) {
          const model = builder(resources)
          const building = createBuilding(powerlineBlueprint, 1, 1, x, y, model.voxelCount)
          addBuildingToSimulation(game.simulation, building)
          tileInfo.building = building
        }
      }
    }
  }

  const range = { start: { x: r.left - 1, y: r.top - 1 }, end: { x: r.right + 1, y: r.bottom + 1 } }
  updateRendererTileInfo(gl, game, range)
}
