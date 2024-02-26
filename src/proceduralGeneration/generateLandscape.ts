import { map, sizes } from "../constants"

// we're generating the height map using the diamond square algorithm
// note that sizes must be 2^n + 1
// https://en.wikipedia.org/wiki/Diamond-square_algorithm
// This generates a Transport Tycoon / Sim City 2000 esque landscape.
// Its harder to get this than a smooth rolling landscape - if you want that basically
// remove the alignment to whole numbers on heights and the limits on "1 rise or fall per unit" rules
// and smooth the result and you'll get a lovely rolling landscape
export function generateHeightMap(size: number) {
  size++
  const rows = getLevelTerrain(size)

  // set the corners
  rows[0][0] = randomHeight()
  rows[0][size - 1] = randomHeight()
  rows[size - 1][0] = randomHeight()
  rows[size - 1][size - 1] = randomHeight()

  recursivelyFill(rows, 0, size - 1, 0, size - 1)

  const newRows = smooth2(smooth2(smooth2(rows))) //smooth(rows)
  //smooth(newRows)
  //smooth(newRows)

  return newRows.map((row) => row.map((h) => h * map.unitRenderHeight))
}

function smooth2(heightMap: number[][]) {
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
      smoothedMap[x][y] = Math.round(sum / 9) // Average of the current cell and its neighbors
    }
  }
  return smoothedMap
}

function smooth(rows: number[][]) {
  const height = rows.length
  const width = rows[0].length
  const newRows: number[][] = []

  function calculateAverage(x: number, y: number) {
    const values = []
    for (let sy = y - 1; sy <= y + 1; sy++) {
      for (let sx = x - 1; sx <= x + 1; sx++) {
        if (sx >= 0 && sy >= 0 && sx < width && sy < height) {
          values.push(rows[y][x])
        }
      }
    }
    return Math.round(values.reduce((t, c) => t + c, 0) / values.length)
  }

  for (let y = 0; y < height; y++) {
    const newRow = []
    for (let x = 0; x < width; x++) {
      newRow.push(calculateAverage(x, y))
    }
    newRows.push(newRow)
  }
  return newRows
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

function randomHeight() {
  return Math.floor(Math.random() * map.maxHeight)
}

function clampToMapHeight(value: number) {
  value = Math.round(value)
  if (value < 0) {
    value = 0
  }
  if (value > map.maxHeight) {
    value = map.maxHeight
  }
  return value
}

function getRandomAdjustment() {
  return Math.round(Math.random() * 2) - 1
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
  const newValue = Math.floor(Math.random() * (maximumHeight - minimumHeight) + minimumHeight)

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
    //const max = Math.min(map.maxHeight, Math.max(v1, v2, v3) + 1)
    const newValue = Math.round(Math.random() * (maximumHeight - minimumHeight) + minimumHeight)
    return newValue
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
