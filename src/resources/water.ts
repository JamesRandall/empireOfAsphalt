import { RenderingModel } from "./models"
import { Landscape, TerrainTypeEnum } from "../model/Landscape"
import { sizes } from "../constants"

const chunkSize = 32

const waterVoxelsPerTile = 4
const waterVoxelSize = sizes.tile / waterVoxelsPerTile

export interface Water {
  chunks: {
    model: RenderingModel
  }[]
}

interface CurrentChunk {
  positions: number[]
  indices: number[]
  normals: number[]
  colors: number[]
  offsets: number[] //this is the animation offset for the water cube
}

export function createWater(gl: WebGL2RenderingContext, landscape: Landscape) {
  const createEmptyChunk = () =>
    ({
      positions: [],
      indices: [],
      normals: [],
      colors: [],
      offsets: [],
    }) as CurrentChunk
  let heightMapSize = landscape.heights.length
  let currentChunk = createEmptyChunk()
  let water: Water = { chunks: [] }
  for (let y = 0; y < heightMapSize - 1; y++) {
    for (let x = 0; x < heightMapSize - 1; x++) {
      const tileInfo = landscape.tileInfo[y][x]
      if (tileInfo.terrain === TerrainTypeEnum.Water) {
        addWaterToChunk(currentChunk, landscape.size - 1, x, y)
      }
      if (currentChunk.positions.length > 48000) {
        water.chunks.push({ model: createWaterRenderingModel(gl, currentChunk) })
        currentChunk = createEmptyChunk()
      }
    }
  }
  if (currentChunk.positions.length > 0) {
    water.chunks.push({ model: createWaterRenderingModel(gl, currentChunk) })
  }
  landscape.water = water
  return water
}

function createWaterRenderingModel(gl: WebGL2RenderingContext, data: CurrentChunk) {
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.positions), gl.STATIC_DRAW)
  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW)
  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.colors), gl.STATIC_DRAW)
  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW)
  const objectInfoBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, objectInfoBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.offsets), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
    objectIdColor: null,
    objectInfo: objectInfoBuffer,
    additionalObjectInfo: null,
    indices: indexBuffer,
    normals: normalBuffer,
    vertexCount: data.indices.length,
    textureCoords: textureCoordBuffer,
    texture: null,
  } as RenderingModel
}

const baseCubePositions = [
  // Front face
  0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
  // Back face
  0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
  // Top face
  0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
  // Bottom face
  0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
  // Right face
  1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
  // Left face
  0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0,
]
const baseCubeIndices = [
  0,
  1,
  2,
  0,
  2,
  3, // front
  4,
  5,
  6,
  4,
  6,
  7, // back
  8,
  9,
  10,
  8,
  10,
  11, // top
  12,
  13,
  14,
  12,
  14,
  15, // bottom
  16,
  17,
  18,
  16,
  18,
  19, // right
  20,
  21,
  22,
  20,
  22,
  23, // left
]
const baseCubeNormals = [
  // Front
  0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

  // Back
  0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

  // Top
  0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

  // Bottom
  0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

  // Right
  1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

  // Left
  -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
]

function addWaterToChunk(chunk: CurrentChunk, mapSize: number, tileX: number, tileY: number) {
  for (let subZ = 0; subZ < waterVoxelsPerTile; subZ++) {
    for (let subX = 0; subX < waterVoxelsPerTile; subX++) {
      addVoxel(chunk, mapSize, tileX, tileY, subX, subZ)
    }
  }
}

function addVoxel(chunk: CurrentChunk, mapSize: number, tileX: number, tileY: number, subX: number, subY: number) {
  const offset = chunk.positions.length / 3
  const voxelX = (tileX - mapSize / 2) * sizes.tile - sizes.tile + subX * waterVoxelSize
  const voxelZ = (mapSize / 2 - tileY) * sizes.tile + subY * waterVoxelSize

  const waterX = tileX * waterVoxelsPerTile + subX
  const waterZ = tileY * waterVoxelsPerTile + subY
  const waveOffset = waterZ % 8

  const color =
    waterZ % 2 == 0
      ? waterX % 2 == 0
        ? [30.0 / 255.0, 127.0 / 255.0, 232.0 / 255.0, 1.0]
        : [120.0 / 255.0, 175.0 / 255.0, 235.0 / 255.0, 1.0]
      : waterX % 2 == 0
        ? [120.0 / 255.0, 175.0 / 255.0, 235.0 / 255.0, 1.0]
        : [30.0 / 255.0, 127.0 / 255.0, 232.0 / 255.0, 1.0]

  for (let pi = 0; pi < baseCubePositions.length; pi += 3) {
    chunk.positions.push(baseCubePositions[pi] * waterVoxelSize + voxelX)
    chunk.positions.push(baseCubePositions[pi + 1] * waterVoxelSize - waterVoxelSize)
    chunk.positions.push(baseCubePositions[pi + 2] * waterVoxelSize + voxelZ)
  }
  chunk.normals = [...chunk.normals, ...baseCubeNormals]
  baseCubeIndices.forEach((vertexIndex) => chunk.indices.push(vertexIndex + offset))
  for (let vi = 0; vi < baseCubePositions.length / 3; vi++) {
    chunk.colors.push(color[0])
    chunk.colors.push(color[1])
    chunk.colors.push(color[2])
    chunk.colors.push(color[3])

    chunk.offsets.push(waveOffset)
    chunk.offsets.push(waveOffset)
    chunk.offsets.push(waveOffset)
    chunk.offsets.push(waveOffset)
  }
}
