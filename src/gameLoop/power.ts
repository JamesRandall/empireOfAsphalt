import { Game } from "../model/game"
import { Landscape } from "../model/Landscape"
import { Building } from "../model/building"
import { Stack } from "../model/stack"
import { updateRendererTileInfo } from "../resources/landscape"
import { ElevatedZoneEnum, ZoneEnum } from "../model/Tile"
import { SimulationLandscape } from "../model/simulation"

const clearPoweredStatus = (landscape: SimulationLandscape) => {
  landscape.tileInfo.forEach((row) =>
    row.forEach((ti) => {
      ti.wasPoweredByBuildingId = ti.isPoweredByBuildingId
      ti.isPoweredByBuildingId = null
      if (ti.building !== null) ti.building.isPoweredByBuildingId = null
    }),
  )
}
const getPowerStations = (buildings: Map<number, Building>) =>
  Array.from(buildings)
    .filter(([buildingId, building]) => building.blueprint.powerGenerated > 0)
    .map(([_, building]) => building)

const isTileConductive = (landscape: SimulationLandscape, x: number, z: number) => {
  const ti = landscape.tileInfo[z][x]
  if (ti.elevatedZone === ElevatedZoneEnum.PowerLine) return true
  switch (ti.zone) {
    case ZoneEnum.Road:
    case ZoneEnum.None:
      return false
    default:
      return ti.building !== null
  }
}

// Walking the connected points on the power grid from a start point (a power station) can be thought of as flood fill
// only the boundaries are defined by a color like in an art program but instead by non-conductive zones.
// I'm using the scan line fill algorithm here.
// There is some nuance in this because we have two things going on:
//  1. Are tiles powered? Tiles are always 1x1
//  2. Are buildings powered? Buildings are of arbitrary sizes and powering a building means all the tiles under it
//     are powered
// We could just use buildings (as a tile can only be powered if it has a building on it - a power line is a building)
// but walking the set of buildings to determine if they are powered is awkward....
// So the complexity is we need to be able to "walk" through buildings in the flood fill.
// Another complexity is that if a tile is already powered by another station then we can't "fill" it and so we
// have to track what tiles have been visited (filled) by the current walk or we'll end up filling forever
const walkPowerGrid = (landscape: SimulationLandscape, powerStation: Building) => {
  let consumedPower = 0
  const stack = new Stack<{ x: number; z: number }>()
  let heightMinusOne = landscape.size - 1
  stack.push(powerStation.position)
  const tileVisited: boolean[][] = Array.from({ length: landscape.size }, () => new Array(landscape.size).fill(false))

  const canMoveToTile = (x: number, z: number) => isTileConductive(landscape, x, z) && !tileVisited[z][x]
  const onLastRow = (p: { z: number }) => p.z === landscape.size - 1
  const onFirstRow = (p: { z: number }) => p.z === 0
  const setPowered = (x: number, z: number) => {
    const ti = landscape.tileInfo[z][x]
    const powerRequirements = ti.building?.blueprint.powerConsumed ?? 0
    const canPower = powerRequirements + consumedPower <= powerStation.blueprint.powerGenerated
    if (canPower) {
      if (ti.isPoweredByBuildingId === null) {
        consumedPower += powerRequirements
        ti.isPoweredByBuildingId = powerStation.buildingId
      }
      if (ti.building !== null && ti.building!.isPoweredByBuildingId === null) {
        ti.building!.isPoweredByBuildingId = powerStation.buildingId
      }
    }
    return true
  }

  while (stack.size > 0 && consumedPower < powerStation.blueprint.powerGenerated) {
    const currentPosition = stack.pop()!
    let startX = currentPosition.x

    while (startX >= 0 && canMoveToTile(startX, currentPosition.z)) {
      startX--
    }
    startX++
    let spanAbove = false
    let spanBelow = false
    while (
      startX < landscape.size &&
      canMoveToTile(startX, currentPosition.z) &&
      consumedPower < powerStation.blueprint.powerGenerated
    ) {
      tileVisited[currentPosition.z][startX] = true
      setPowered(startX, currentPosition.z)
      if (!spanBelow && !onLastRow(currentPosition) && canMoveToTile(startX, currentPosition.z + 1)) {
        stack.push({ x: startX, z: currentPosition.z + 1 })
        spanBelow = true
      } else if (spanBelow && !onLastRow(currentPosition) && !canMoveToTile(startX, currentPosition.z + 1)) {
        spanBelow = false
      }
      if (!spanAbove && !onFirstRow(currentPosition) && canMoveToTile(startX, currentPosition.z - 1)) {
        stack.push({ x: startX, z: currentPosition.z - 1 })
        spanAbove = true
      } else if (spanAbove && !onFirstRow(currentPosition) && !canMoveToTile(startX, currentPosition.z - 1)) {
        spanAbove = false
      }
      startX++
    }
  }
  return consumedPower
}

function updateRenderer(gl: WebGL2RenderingContext, game: Game) {
  const landscape = game.simulation.landscape
  let minZ = landscape.size
  let minX = landscape.size
  let maxZ = -1
  let maxX = -1
  for (let z = 0; z < landscape.size - 1; z++) {
    for (let x = 0; x < landscape.size - 1; x++) {
      const ti = landscape.tileInfo[z][x]
      if (!ti) debugger
      if (ti.wasPoweredByBuildingId !== ti.isPoweredByBuildingId) {
        minZ = Math.min(z, minZ)
        minX = Math.min(x, minX)
        maxZ = Math.max(z, maxZ)
        maxX = Math.max(x, maxX)
      }
    }
  }
  if (maxZ !== -1) {
    updateRendererTileInfo(gl, game, { start: { x: minX, y: minZ }, end: { x: maxX, y: maxZ } })
  }
}

export function updatePowerGrid(gl: WebGL2RenderingContext, game: Game) {
  clearPoweredStatus(game.simulation.landscape)
  const powerStations = getPowerStations(game.simulation.buildings)
  const totalPowerAvailable = powerStations.reduce((v, ps) => v + ps.blueprint.powerGenerated, 0)
  const remainingPower = powerStations.reduce(
    (remaining, powerStation) => remaining - walkPowerGrid(game.simulation.landscape, powerStation),
    totalPowerAvailable,
  )
  updateRenderer(gl, game)
}
