import { addBuildingToGame, Game, removeBuildingFromGame } from "../model/game"
import { TileInfo, ZoneEnum } from "../model/Tile"
import { Landscape } from "../model/Landscape"
import { Demand, getExternalDemand } from "./industrialDemand"
import {
  BlueprintCategory,
  blueprintsForCategoryAndGrowth,
  Building,
  BuildingType,
  createBuildingFromBlueprint,
} from "../model/building"
import { Resources } from "../resources/resources"

// the closer the tile is to transport the higher the score and therefore the more likely growth is to occur
const transportScoreTable = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 2, 1, 0, 0],
  [0, 1, 2, 3, 2, 1, 0],
  [1, 2, 3, 0, 3, 2, 1],
  [0, 1, 2, 3, 2, 1, 0],
  [0, 0, 1, 2, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
]

const weightings = {
  transport: 1,
  industrialDemand: 2,
}

function isDynamicZone(tile: TileInfo) {
  switch (tile.zone) {
    case ZoneEnum.LightResidential:
      return true
    case ZoneEnum.DenseResidential:
      return true
    case ZoneEnum.LightCommercial:
      return true
    case ZoneEnum.DenseCommercial:
      return true
    case ZoneEnum.LightIndustrial:
      return true
    case ZoneEnum.DenseIndustrial:
      return true
    default:
      return false
  }
}

function evaluateAdjacentTiles(landscape: Landscape, x: number, z: number, evalFunc: (tile: TileInfo) => boolean) {
  if (z > 0 && evalFunc(landscape.tileInfo[z - 1][x])) {
    return true
  }
  if (z < landscape.size - 1 && evalFunc(landscape.tileInfo[z + 1][x])) {
    return true
  }
  if (x > 0 && evalFunc(landscape.tileInfo[z][x - 1])) {
    return true
  }
  if (x < landscape.size - 1 && evalFunc(landscape.tileInfo[z][x + 1])) {
    return true
  }
  return false
}

// TODO: this needs to consider adjacent tiles with power
function canBeConsideredForGrowth(landscape: Landscape, tile: TileInfo, x: number, z: number) {
  return (
    (tile.isPoweredByBuildingId !== null ||
      evaluateAdjacentTiles(landscape, x, z, (t) => t.isPoweredByBuildingId !== null)) &&
    tile.accruingGrowthScore < getGrowthCapForTile(tile)
  )
}

function mustBeForcedToDecline(landscape: Landscape, tile: TileInfo, x: number, z: number) {
  const isPowered =
    tile.isPoweredByBuildingId !== null ||
    evaluateAdjacentTiles(landscape, x, z, (t) => t.isPoweredByBuildingId !== null)
  return !isPowered
}

function evaluatePatternBasedScore(
  landscape: Landscape,
  tx: number,
  tz: number,
  scoreTable: number[][],
  evalFunc: (tile: TileInfo) => boolean,
) {
  const size = scoreTable.length // score tables must always be an odd number long
  const center = Math.floor(size / 2)
  const maxCoord = landscape.size - 1
  let score = 0
  for (let z = -center; z <= center; z++) {
    if (tz + z >= 0 && tz + z < maxCoord) {
      const scoreRow = scoreTable[z + center]
      const tileRow = landscape.tileInfo[tz + z]
      for (let x = -center; x <= center; x++) {
        if (tx + x >= 0 && tx + x < maxCoord) {
          const tile = tileRow[tx + x]
          const isMatch = evalFunc(tile)
          if (isMatch) {
            score += scoreRow[x + center]
          }
        }
      }
    }
  }
  return score
}

function growOrShrinkTile(externalDemand: Demand, landscape: Landscape, tile: TileInfo, x: number, z: number) {
  let growthScore = 0
  // all zones need access to transport and the closer the transport the better
  const transportScore = evaluatePatternBasedScore(
    landscape,
    x,
    z,
    transportScoreTable,
    (ti) => ti.zone === ZoneEnum.Road,
  )
  if (transportScore === 0) {
    forceDeclineOfTile(externalDemand, landscape, tile, x, z)
    return
  }
  tile.baselineGrowthScore = transportScore * weightings.transport
  applyIndustrialGrowthScore(tile, externalDemand)
}

function getGrowthCapForTile(tile: TileInfo) {
  if (
    tile.building !== null &&
    tile.building.blueprint.growthCap !== null &&
    tile.building.blueprint.buildingType !== BuildingType.PowerLine
  ) {
    return tile.building.blueprint.growthCap!
  }
  switch (tile.zone) {
    case ZoneEnum.LightCommercial:
    case ZoneEnum.LightIndustrial:
    case ZoneEnum.LightResidential:
      return 10
    case ZoneEnum.DenseCommercial:
    case ZoneEnum.DenseIndustrial:
    case ZoneEnum.DenseResidential:
      return 30
  }
  return 0
}

function canConstructOnTile(tile: TileInfo) {
  return tile.building === null || tile.building.blueprint.buildingType === BuildingType.PowerLine
}

function applyIndustrialGrowthScore(tile: TileInfo, demand: Demand) {
  const growthCapForTile = getGrowthCapForTile(tile)
  if (tile.accruingGrowthScore >= growthCapForTile) return
  if (tile.zone === ZoneEnum.LightIndustrial) {
    if (canConstructOnTile(tile) && demand.industrial.light > 0) {
      tile.accruingGrowthScore += 1 * weightings.industrialDemand
      if (tile.accruingGrowthScore > growthCapForTile) {
        tile.accruingGrowthScore = growthCapForTile
      }
      demand.industrial.light = Math.max(0, demand.industrial.light - 1 * weightings.industrialDemand)
    }
  } /*else if (tile.zone === ZoneEnum.DenseIndustrial) {
    if (demand.industrial.heavy > 0) {
      tile.accruingGrowthScore += 1 * weightings.industrialDemand
      demand.industrial.heavy--
    }
  }*/
}

function forceDeclineOfTile(externalDemand: Demand, landscape: Landscape, tile: TileInfo, x: number, z: number) {
  // if there is no access to power - reduce the zones score
  // if there is no access to transport - reduce the zones score
}

function blueprintCategoryForZone(zone: ZoneEnum) {
  switch (zone) {
    case ZoneEnum.LightCommercial:
    case ZoneEnum.DenseCommercial:
      return BlueprintCategory.Commercial
    case ZoneEnum.LightIndustrial:
    case ZoneEnum.DenseIndustrial:
      return BlueprintCategory.Industrial
    case ZoneEnum.LightResidential:
    case ZoneEnum.DenseResidential:
      return BlueprintCategory.Residential
    default:
      return BlueprintCategory.Other
  }
}

function applyGrowthScoreToTile(game: Game, resources: Resources, tile: TileInfo, x: number, z: number) {
  //const growthCapForTile = getGrowthCapForTile(tile)
  const growthScore = tile.accruingGrowthScore
  if (canConstructOnTile(tile)) {
    const category = blueprintCategoryForZone(tile.zone)
    const blueprints = blueprintsForCategoryAndGrowth(category, growthScore)
    if (blueprints.length > 0) {
      if (tile.building !== null) {
        removeBuildingFromGame(game, tile.building)
      }
      const building = createBuildingFromBlueprint(resources, blueprints[0], { x: x, z: z })
      building.numberOfVoxelsToDisplay = 0
      addBuildingToGame(game, building)
    }
  }
}

function consumeDemand(demand: Demand, buildings: Building[]) {
  buildings.forEach((building) => {
    demand.industrial.heavy -= building.blueprint.isHeavyIndustrial ? building.blueprint.output : 0
    demand.industrial.light -= !building.blueprint.isHeavyIndustrial ? building.blueprint.output : 0
  })
}

/*
export function applyGrowthOld(game: Game, resources: Resources) {
  // TODO: to make this feel more natural we need to change a few thinsgs and make it a multi-stage process
  const externalDemand = getExternalDemand(game.time.clock)
  consumeDemand(externalDemand, Array.from(game.buildings.values()))
  for (let z = 0; z < game.landscape.size - 1; z++) {
    const tileRow = game.landscape.tileInfo[z]
    for (let x = 0; x < game.landscape.size - 1; x++) {
      const tile = tileRow[x]
      if (!isDynamicZone(tile)) continue
      if (canBeConsideredForGrowth(game.landscape, tile, x, z)) {
        growOrShrinkTile(externalDemand, game.landscape, tile, x, z)
      }
      if (mustBeForcedToDecline(game.landscape, tile, x, z)) {
        forceDeclineOfTile(externalDemand, game.landscape, tile, x, z)
      }
      applyGrowthScoreToTile(game, resources, tile, x, z)
    }
  }
}

 */

export function applyGrowth(game: Game, resources: Resources) {
  const demand = getExternalDemand(game.time.clock)
  const growthCandidates: { tile: TileInfo; x: number; z: number }[] = []
  consumeDemand(demand, Array.from(game.buildings.values()))
  // 1. first we calculate the base growth scores for tiles - water, transport, power links etc.
  for (let z = 0; z < game.landscape.size - 1; z++) {
    const tileRow = game.landscape.tileInfo[z]
    for (let x = 0; x < game.landscape.size - 1; x++) {
      const tile = tileRow[x]
      if (!isDynamicZone(tile)) continue
      if (canBeConsideredForGrowth(game.landscape, tile, x, z)) {
        setBaseGrowthScoreForTile(game.landscape, demand, tile, x, z)
        if (tile.baselineGrowthScore > 0) {
          growthCandidates.push({ tile, x, z })
        }
      }
    }
  }
  // 2. now we grow the tiles based on surplus demand - higher scoring tiles first
  const sortedGrowthCandidates = growthCandidates.sort(
    (a, b) => b.tile.baselineGrowthScore - a.tile.baselineGrowthScore,
  )
  for (let i = 0; i < sortedGrowthCandidates.length; i++) {
    if (demand.industrial.light <= 0) break
    const candidate = sortedGrowthCandidates[i]
    applyIndustrialGrowthScore(candidate.tile, demand)
    applyGrowthScoreToTile(game, resources, candidate.tile, candidate.x, candidate.z)
  }
}

function hasAccessToPower(landscape: Landscape, tile: TileInfo, x: number, z: number) {
  return (
    tile.isPoweredByBuildingId !== null ||
    evaluateAdjacentTiles(landscape, x, z, (t) => t.isPoweredByBuildingId !== null)
  )
}

function setBaseGrowthScoreForTile(landscape: Landscape, demand: Demand, tile: TileInfo, x: number, z: number) {
  if (!hasAccessToPower(landscape, tile, x, z)) {
    tile.baselineGrowthScore = 0
    return
  }
  const transportScore = evaluatePatternBasedScore(
    landscape,
    x,
    z,
    transportScoreTable,
    (ti) => ti.zone === ZoneEnum.Road,
  )

  tile.baselineGrowthScore = transportScore * weightings.transport
}
