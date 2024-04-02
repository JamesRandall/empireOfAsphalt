import { RenderingModel } from "./models"

// index buffer max value is 65536-1 so we need to break models into chunks
// like the landscape - 1800*36 is just under 65535
/*const maxVoxelsPerChunk = 1800

interface VoxelFile {
  version: string
  project: {
    name: string
    voxels: number
    meshes: number
  }
  data: {
    voxels: string
    meshes: string
  }
}

interface SourceVoxel {
  x: number
  y: number
  z: number
  color: { r: number; g: number; b: number }
  visible: boolean
}*/

export interface VoxelModel {
  width: number
  height: number
  depth: number
  voxelCount: number
  chunkSize: number
  renderingModels: RenderingModel[]
}

/*
function prune(voxels: SourceVoxel[], width: number, height: number, depth: number) {
  const grid: boolean[][][] = []
  for (let z = 0; z < depth; z++) {
    const zSet: boolean[][] = []
    for (let y = 0; y < height; y++) {
      const ySet: boolean[] = []
      for (let x = 0; x < width; x++) {
        ySet.push(false)
      }
      zSet.push(ySet)
    }
    grid.push(zSet)
  }

  voxels.forEach((v) => {
    grid[v.z][v.y][v.x] = true
  })

  return voxels.filter((v) => {
    if (v.x === 0 || v.y === 0 || v.z === 0 || v.x === width - 1 || v.y === height - 1 || v.z === depth - 1) return true
    return !(
      grid[v.z][v.y][v.x - 1] &&
      grid[v.z][v.y][v.x + 1] &&
      grid[v.z][v.y - 1][v.x] &&
      grid[v.z][v.y + 1][v.x] &&
      grid[v.z - 1][v.y][v.x] &&
      grid[v.z + 1][v.y][v.x]
    )
  })
}

function parseVoxelData(data: string): SourceVoxel[] {
  return data
    .split(";")
    .filter((vs) => vs.length > 0)
    .map((voxelString) => {
      const voxelComponents = voxelString.split(",")
      const color = parseInt(voxelComponents[3].substring(1), 16)
      const r = ((color & 0xff0000) >> 16) / 255.0
      const g = ((color & 0x00ff00) >> 8) / 255.0
      const b = (color & 0x0000ff) / 255.0
      return {
        x: parseInt(voxelComponents[0]),
        y: parseInt(voxelComponents[1]),
        z: parseInt(voxelComponents[2]),
        color: { r, g, b },
        visible: voxelComponents[4] === "true",
      }
    })
}

function createRenderingModels(gl: WebGL2RenderingContext, voxels: SourceVoxel[]) {
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

  let positions: number[] = []
  let indices: number[] = []
  let normals: number[] = []
  let colors: number[] = []
  let renderingModels: RenderingModel[] = []

  let chunkCount = 0
  voxels.forEach((voxel) => {
    const offset = positions.length / 3
    for (let pi = 0; pi < baseCubePositions.length; pi += 3) {
      positions.push(baseCubePositions[pi] + voxel.x)
      positions.push(baseCubePositions[pi + 1] + voxel.y)
      positions.push(baseCubePositions[pi + 2] + voxel.z)
    }
    normals = [...normals, ...baseCubeNormals]
    baseCubeIndices.forEach((vertexIndex) => indices.push(vertexIndex + offset))
    for (let vi = 0; vi < baseCubePositions.length / 3; vi++) {
      colors.push(voxel.color.r)
      colors.push(voxel.color.g)
      colors.push(voxel.color.b)
      colors.push(1.0)
    }

    chunkCount++
    if (chunkCount > maxVoxelsPerChunk) {
      chunkCount = 0
      renderingModels.push(createRenderingModel(gl, positions, indices, normals, colors))
      positions = []
      indices = []
      normals = []
      colors = []
    }
  })
  if (positions.length > 0) {
    renderingModels.push(createRenderingModel(gl, positions, indices, normals, colors))
  }
  return renderingModels
}*/

interface ModelFormat {
  width: number
  height: number
  depth: number
  voxelCount: number
  chunkSize: number
  chunks: [
    {
      positions: number[]
      indices: number[]
      colors: number[]
      normals: number[]
    },
  ]
}

function createRenderingModel(
  gl: WebGL2RenderingContext,
  positions: number[],
  indices: number[],
  normals: number[],
  colors: number[],
) {
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
    objectIdColor: null,
    objectInfo: null,
    additionalObjectInfo: null,
    indices: indexBuffer,
    normals: normalBuffer,
    vertexCount: indices.length,
    textureCoords: textureCoordBuffer,
    texture: null,
  } as RenderingModel
}

// eventually we'll want to optimise this in a couple of ways including
// 1. remove voxels that cannot be seen (i.e. their is a voxel on every side of them). We should do this as a
//    preprocessing step as it will also speed up loading (as in write a tool to do it)
// 2. identify the surfaces and generate a simpler mesh - we'd be able to use this when a
//    building is fully in place and not constructing
export async function loadVoxelModel(gl: WebGL2RenderingContext, name: string): Promise<VoxelModel> {
  const response = await fetch(`voxels/${name}.json`)
  const voxelFile = (await response.json()) as ModelFormat

  return {
    width: voxelFile.width,
    height: voxelFile.height,
    depth: voxelFile.depth,
    voxelCount: voxelFile.voxelCount,
    chunkSize: voxelFile.chunkSize,
    renderingModels: voxelFile.chunks.map((c) => createRenderingModel(gl, c.positions, c.indices, c.normals, c.colors)),
  }
}
