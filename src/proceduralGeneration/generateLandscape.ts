import { map } from "../constants"
import { ElevatedZoneEnum, TerrainTypeEnum, TileInfo, ZoneEnum } from "../model/Tile"

const seedrandom = require("seedrandom")
const rnd = seedrandom() // seedrandom("hello.")
export function random() {
  return rnd()
}

const flatter = false

// we're generating the height map using the diamond square algorithm
// note that sizes must be 2^n + 1
// https://en.wikipedia.org/wiki/Diamond-square_algorithm
// This generates a Transport Tycoon / Sim City 2000 esque landscape.
// Its harder to get this than a smooth rolling landscape - if you want that basically
// remove the alignment to whole numbers on heights and the limits on "1 rise or fall per unit" rules
// and smooth the result and you'll get a lovely rolling landscape
export function generateSimulationLandscape(size: number) {
  if (!isPowerOfTwo(size)) {
    throw Error("Map sizes must be a power of two: 16, 32, 64, etc.")
  }
  size++
  let rows = getLevelTerrain(size)
  //rows = generateHills(rows, 0, size, 0, size) // whole map

  rows = generateHills(rows, 0, Math.ceil(size / 4), 0, Math.ceil(size / 4))
  rows = generateHills(
    rows,
    Math.ceil(size / 8),
    Math.ceil(size / 4) + Math.ceil(size / 8),
    Math.ceil(size / 8),
    Math.ceil(size / 4) + Math.ceil(size / 8),
  )

  for (let i = 0; i < map.smoothingIterations; i++) {
    rows = smooth(rows)
  }

  const tileInfos: TileInfo[][] = []
  const heights = rows.map((row) => row.map((h) => h * map.unitRenderHeight))
  for (let y = 0; y < size - 1; y++) {
    const row: TileInfo[] = []
    for (let x = 0; x < size - 1; x++) {
      const isFlat =
        heights[y][x] == heights[y][x + 1] &&
        heights[y][x] == heights[y + 1][x] &&
        heights[y][x] == heights[y + 1][x + 1]
      row.push({
        terrain: x >= 126 && x <= 132 && y >= 124 && y <= 132 ? TerrainTypeEnum.Water : TerrainTypeEnum.Plain,
        //terrain: x >= 10 && x <= 132 && y >= 10 && y <= 132 ? TerrainTypeEnum.Water : TerrainTypeEnum.Plain,
        //terrain: TerrainTypeEnum.Plain,
        zone: ZoneEnum.None,
        elevatedZone: ElevatedZoneEnum.None,
        isFlat,
        textureIndex: null,
        isPoweredByBuildingId: null,
        wasPoweredByBuildingId: null,
        building: null,
        accruingGrowthScore: 0,
        baselineGrowthScore: 0,
      })
    }
    tileInfos.push(row)
  }

  return {
    tileInfo: tileInfos,
    size: size,
    heights: heights,
  }
}

function generateHills(rows: number[][], fromX: number, toX: number, fromY: number, toY: number) {
  const randomStartingHeight = () => 0 // getHeight(0, map.maxHeight)

  //rows[0][0] = randomHeight()
  //rows[0][size - 1] = randomHeight()
  //rows[size - 1][0] = randomHeight()
  //rows[size - 1][size - 1] = randomHeight()

  // set the corners
  if (rows[fromX][fromY] === 0) rows[fromX][fromY] = randomStartingHeight()
  if (rows[fromX][toY - 1] === 0) rows[fromX][toY - 1] = randomStartingHeight()
  if (rows[toX - 1][fromY] === 0) rows[toX - 1][fromY] = randomStartingHeight()
  if (rows[toX - 1][toY - 1] === 0) rows[toX - 1][toY - 1] = randomStartingHeight()
  recursivelyFill(rows, fromX, toX - 1, fromY, toY - 1)

  return rows
}

function smooth(heightMap: number[][]) {
  const width = heightMap.length
  const height = heightMap[0].length
  const smoothedMap = Array.from(Array(width), () => Array(height).fill(0))

  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      let sum = 0
      for (let offsetX = -1; offsetX <= 1; offsetX++) {
        for (let offsetY = -1; offsetY <= 1; offsetY++) {
          sum += heightMap[x + offsetX][y + offsetY]
        }
      }
      // Average of the current cell and its neighbors
      // floor will leave more flat areas
      // round will tend towards more up and down
      smoothedMap[x][y] = Math.floor(sum / 9)
    }
  }
  return smoothedMap
}

function recursivelyFill(rows: number[][], fromX: number, toX: number, fromY: number, toY: number) {
  diamondStep(rows, fromX, toX, fromY, toY)
  squareStep(rows, fromX, toX, fromY, toY)
  const xLen = (toX - fromX) / 2
  const yLen = (toY - fromY) / 2

  if (xLen === 1 || yLen === 1) return

  for (let newY = fromY; newY < toY; newY += yLen) {
    for (let newX = fromX; newX < toX; newX += xLen) {
      recursivelyFill(rows, newX, newX + xLen, newY, newY + yLen)
    }
  }
}

function getHeight(minimumHeight: number, maximumHeight: number) {
  return flatter
    ? Math.round((random() / 2) * (maximumHeight - minimumHeight) + minimumHeight)
    : Math.round(random() * (maximumHeight - minimumHeight) + minimumHeight)
}

function diamondStep(rows: number[][], fromX: number, toX: number, fromY: number, toY: number) {
  const neighbours = [rows[fromY][fromX], rows[fromY][toX], rows[toY][fromX], rows[toY][toX]]
  const centerX = (toX - fromX) / 2 + fromX
  const centerY = (toY - fromY) / 2 + fromY

  let lowestNeighbour = Math.min(...neighbours)
  let highestNeighbour = Math.max(...neighbours)
  let cost = centerY - fromY

  let leftDistance = toX - fromX
  let leftX = centerX - leftDistance
  if (leftX > 0) {
    let leftStep = rows[centerY][leftX]
    if (leftStep < lowestNeighbour) {
      lowestNeighbour = leftStep
      cost = leftDistance
    }
    if (leftStep > highestNeighbour) {
      highestNeighbour = leftStep
      cost = leftDistance
    }
  }

  const topDistance = toY - fromY
  let topY = centerY - topDistance
  if (topY > 0) {
    let topStep = rows[topY][centerX]
    if (topStep < lowestNeighbour) {
      lowestNeighbour = topStep
      cost = topDistance
    } else if (topStep > highestNeighbour) {
      highestNeighbour = topStep
      cost = topDistance
    }
  }

  const maximumHeight = lowestNeighbour + cost
  const minimumHeight = highestNeighbour - cost
  const newValue = getHeight(minimumHeight, maximumHeight)

  rows[centerY][centerX] = Math.min(map.maxHeight, Math.max(0, newValue))
}

function squareStep(rows: number[][], fromX: number, toX: number, fromY: number, toY: number) {
  const distance = (toX - fromX) / 2
  const centerX = (toX - fromX) / 2 + fromX
  const centerY = (toY - fromY) / 2 + fromY

  function getNewSquareValue(v1: number, v2: number, v3: number) {
    const lowestNeighbour = Math.min(v1, v2, v3)
    const highestNeighbour = Math.max(v1, v2, v3)
    const maximumHeight = Math.min(map.maxHeight, lowestNeighbour + distance) // maximum is 1 unit per tile increase from lowest neighbour
    const minimumHeight = Math.max(0, highestNeighbour - distance) // minimum is 1 unit per tile down from hieghest newighbour
    return getHeight(minimumHeight, maximumHeight)
  }

  const centerValue = rows[centerY][centerX]
  const topLeftValue = rows[fromY][fromX]
  const topRightValue = rows[fromY][toX]
  const bottomLeftValue = rows[toY][fromX]
  const bottomRightValue = rows[toY][toX]

  const topValue = getNewSquareValue(topLeftValue, topRightValue, centerValue)
  const leftValue = getNewSquareValue(topLeftValue, bottomLeftValue, centerValue)
  const bottomValue = getNewSquareValue(bottomLeftValue, bottomRightValue, centerValue)
  const rightValue = getNewSquareValue(topRightValue, bottomRightValue, centerValue)

  rows[fromY][centerX] = topValue
  rows[toY][centerX] = bottomValue
  rows[centerY][fromX] = leftValue
  rows[centerY][toX] = rightValue
}

function getLevelTerrain(size: number) {
  const rows: number[][] = []
  for (let y = 0; y < size; y++) {
    const row: number[] = []
    for (let x = 0; x < size; x++) {
      row.push(0)
    }
    rows.push(row)
  }
  return rows
}

function isPowerOfTwo(n: number) {
  return n > 0 && (n & (n - 1)) === 0
}
