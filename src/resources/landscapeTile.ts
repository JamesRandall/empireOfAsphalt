import { vec3, vec4 } from "gl-matrix"
import { sizes } from "../constants"
import { Outline, RenderingModel } from "./models"

function calculateTriangleNormal(v1: vec3, v2: vec3, v3: vec3) {
  let edge1 = vec3.create()
  vec3.subtract(edge1, v2, v1)
  let edge2 = vec3.create()
  vec3.subtract(edge2, v3, v1)
  let normal = vec3.create()
  vec3.cross(normal, edge1, edge2)
  vec3.normalize(normal, normal)
  return normal // This is the surface normal
}

export function createLandscape(gl: WebGL2RenderingContext, heights: number[][]) {
  const positions: number[] = []
  const indices: number[] = []

  const normals: number[] = []
  const textureCoords: number[] = []
  const colors: number[] = []
  //const outlineColors: number[] = []
  const outlines: Outline[] = []

  const half = sizes.tile / 2
  const faceIndices = [3, 0, 1, 3, 1, 2]
  const standardTextureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]
  const grass = vec4.fromValues(0, 1, 0, 1)
  const water = vec4.fromValues(0, 0, 1, 1)

  for (let y = 0; y < heights.length - 1; y++) {
    let rowTopHeights = heights[y]
    let rowBottomHeights = heights[y + 1]
    const top = sizes.tile * y

    const outlineIndices: number[] = []
    for (let x = 0; x < rowTopHeights.length - 1; x++) {
      const left = sizes.tile * x
      const indexOffset = positions.length / 3
      const v0 = vec3.fromValues(-half + left, rowTopHeights[x], -half + top)
      const v1 = vec3.fromValues(half + left, rowTopHeights[x + 1], -half + top)
      const v2 = vec3.fromValues(half + left, rowBottomHeights[x + 1], half + top)
      const v3 = vec3.fromValues(-half + left, rowBottomHeights[x], half + top)
      const tilePositions = [v0[0], v0[1], v0[2], v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2]]

      const n1 = calculateTriangleNormal(v1, v0, v3)
      const n2 = calculateTriangleNormal(v2, v1, v3)

      tilePositions.forEach((p) => positions.push(p))
      faceIndices.forEach((i) => indices.push(i + indexOffset))
      //faceIndices.forEach((i) => outlineIndices.push(i + indexOffset))
      outlineIndices.push(indexOffset + 3)
      outlineIndices.push(indexOffset)
      outlineIndices.push(indexOffset + 1)
      outlineIndices.push(indexOffset + 2)
      //outlineIndices.push(indexOffset)
      //standardNormals.forEach((n) => normals.push(n))
      normals.push(n1[0])
      normals.push(n1[1])
      normals.push(n1[2])
      normals.push(n1[0])
      normals.push(n1[1])
      normals.push(n1[2])
      normals.push(n2[0])
      normals.push(n2[1])
      normals.push(n2[2])
      normals.push(n2[0])
      normals.push(n2[1])
      normals.push(n2[2])

      standardTextureCoords.forEach((stc) => textureCoords.push(stc))
      for (let v = 0; v < 4; v++) {
        colors.push(grass[0])
        colors.push(grass[1])
        colors.push(grass[2])
        colors.push(grass[3])

        //outlineColors.push(0)
        //outlineColors.push(0)
        //outlineColors.push(0)
        //outlineColors.push(1)
      }
    }
    const outlineIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outlineIndexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(outlineIndices), gl.STATIC_DRAW)
    outlines.push({
      indices: outlineIndexBuffer!,
      vertexCount: outlineIndices.length,
      color: vec4.fromValues(0, 0, 0, 1),
    })
  }

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
  //const outlineColorBuffer = gl.createBuffer()
  //gl.bindBuffer(gl.ARRAY_BUFFER, outlineColorBuffer)
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(outlineColors), gl.STATIC_DRAW)
  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    //outlineIndices: outlineIndexBuffer,
    //outlineVertexCount: outlineIndices.length,
    outlines: outlines,
    normals: normalBuffer,
    vertexCount: indices.length,
    textureCoords: textureCoordBuffer,
    texture: null,
  } as RenderingModel
}

export function createTile(
  gl: WebGL2RenderingContext,
  color: vec4,
  heights: {
    topLeft: number
    topRight: number
    bottomLeft: number
    bottomRight: number
  },
) {
  const half = sizes.tile / 2
  const positions = [
    -half,
    heights.topLeft,
    -half,
    half,
    heights.topRight,
    -half,
    half,
    heights.bottomRight,
    half,
    -half,
    heights.bottomLeft,
    half,
  ]
  const indices = [3, 0, 1, 3, 1, 2]
  //const normals = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
  const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
  const textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]
  const colors = [
    color[0],
    color[1],
    color[2],
    color[3],
    color[0],
    color[1],
    color[2],
    color[3],
    color[0],
    color[1],
    color[2],
    color[3],
    color[0],
    color[1],
    color[2],
    color[3],
  ]

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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    normals: normalBuffer,
    vertexCount: indices.length,
    textureCoords: textureCoordBuffer,
    texture: null,
  } as RenderingModel
}
