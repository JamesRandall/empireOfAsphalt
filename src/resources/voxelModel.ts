import { RenderingModel } from "./models"

export interface VoxelModel {
  width: number
  height: number
  depth: number
  voxelCount: number
  chunkSize: number
  renderingModels: RenderingModel[]
}

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
